import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { ModerationActionEnum, UserStatusEnum } from "@prisma/client";

// Helper to verify if user is an ADMIN
const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { role: true },
  });
  return user?.role?.name === "ADMIN";
};

export const reportContentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { targetEntityType, targetEntityId, reason, details } = req.body;

    if (!targetEntityType || !targetEntityId || !reason) {
      res.status(400).json({
        message: "targetEntityType, targetEntityId, and reason are required",
      });
      return;
    }

    // Create a moderation log representing the report flagged by the user
    const reportLog = await prisma.contentModerationLog.create({
      data: {
        moderatorId: userId, // In flagged reports, the flagger acts as the initiator
        targetEntityType,
        targetEntityId,
        action: ModerationActionEnum.FLAGGED,
        reason,
        details: details || {},
      },
    });

    res.status(201).json({
      message: "Content flagged and reported successfully",
      report: reportLog,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to submit report" });
  }
};

export const getReportsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!(await isAdmin(userId))) {
      res.status(403).json({ message: "Forbidden: Admin access required" });
      return;
    }

    const reports = await prisma.contentModerationLog.findMany({
      include: {
        moderator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch reports" });
  }
};

export const warnUserController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!(await isAdmin(userId))) {
      res.status(403).json({ message: "Forbidden: Admin access required" });
      return;
    }

    const { targetUserId, reason, details } = req.body;

    if (!targetUserId || !reason) {
      res.status(400).json({ message: "targetUserId and reason are required" });
      return;
    }

    // Verify recipient user exists
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!targetUser) {
      res.status(404).json({ message: "Target user not found" });
      return;
    }

    // Log the warning action
    const moderationLog = await prisma.contentModerationLog.create({
      data: {
        moderatorId: userId,
        targetEntityType: "USER",
        targetEntityId: targetUserId,
        action: ModerationActionEnum.WARNED,
        reason,
        details: details || {},
      },
    });

    // Send a warning notification to the user
    await prisma.notification.create({
      data: {
        recipientId: targetUserId,
        senderId: userId,
        type: "SYSTEM",
        title: "Official Content Moderation Warning",
        body: `You have received an official warning. Reason: ${reason}`,
      },
    });

    res.status(201).json({
      message: "Warning issued successfully and notified to the user",
      log: moderationLog,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to issue warning" });
  }
};

export const removeContentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!(await isAdmin(userId))) {
      res.status(403).json({ message: "Forbidden: Admin access required" });
      return;
    }

    const { targetEntityType, targetEntityId, reason, details } = req.body;

    if (!targetEntityType || !targetEntityId || !reason) {
      res.status(400).json({
        message: "targetEntityType, targetEntityId, and reason are required",
      });
      return;
    }

    // Perform removal depending on content type
    let removalSuccess = false;
    const typeUpper = targetEntityType.toUpperCase();

    if (typeUpper === "POST" || typeUpper === "SOCIALPOST") {
      const post = await prisma.socialPost.findFirst({
        where: { id: targetEntityId, deletedAt: null },
      });
      if (post) {
        await prisma.socialPost.update({
          where: { id: targetEntityId },
          data: { deletedAt: new Date() },
        });
        removalSuccess = true;
      }
    } else if (typeUpper === "STORY") {
      const story = await prisma.story.findFirst({
        where: { id: targetEntityId, deletedAt: null },
      });
      if (story) {
        await prisma.story.update({
          where: { id: targetEntityId },
          data: { deletedAt: new Date() },
        });
        removalSuccess = true;
      }
    } else if (typeUpper === "MESSAGE" || typeUpper === "OFFICIALMESSAGE") {
      const msg = await prisma.officialMessage.findFirst({
        where: { id: targetEntityId, deletedAt: null },
      });
      if (msg) {
        await prisma.officialMessage.update({
          where: { id: targetEntityId },
          data: { deletedAt: new Date() },
        });
        removalSuccess = true;
      }
    } else {
      res.status(400).json({
        message: `Removal not supported directly for type: ${targetEntityType}`,
      });
      return;
    }

    if (!removalSuccess) {
      res.status(404).json({ message: "Target content not found or already deleted" });
      return;
    }

    // Log the removal action
    const moderationLog = await prisma.contentModerationLog.create({
      data: {
        moderatorId: userId,
        targetEntityType,
        targetEntityId,
        action: ModerationActionEnum.REMOVED,
        reason,
        details: details || {},
      },
    });

    res.status(200).json({
      message: "Content removed successfully",
      log: moderationLog,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to remove content" });
  }
};

export const banUserController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!(await isAdmin(userId))) {
      res.status(403).json({ message: "Forbidden: Admin access required" });
      return;
    }

    const { targetUserId, reason, details } = req.body;

    if (!targetUserId || !reason) {
      res.status(400).json({ message: "targetUserId and reason are required" });
      return;
    }

    // Check if target user exists
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!targetUser) {
      res.status(404).json({ message: "Target user not found" });
      return;
    }

    // Ban the user by changing their status to SUSPENDED
    await prisma.user.update({
      where: { id: targetUserId },
      data: { status: UserStatusEnum.SUSPENDED },
    });

    // Log the ban action
    const moderationLog = await prisma.contentModerationLog.create({
      data: {
        moderatorId: userId,
        targetEntityType: "USER",
        targetEntityId: targetUserId,
        action: ModerationActionEnum.BANNED,
        reason,
        details: details || {},
      },
    });

    res.status(200).json({
      message: "User suspended/banned successfully",
      log: moderationLog,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to ban user" });
  }
};
