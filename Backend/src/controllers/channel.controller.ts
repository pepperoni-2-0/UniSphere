import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { OfficialChannelService } from "../services/OfficialChannelService.js";
import { prisma } from "../lib/prisma.js";

const channelService = new OfficialChannelService();

export const createChannelController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { role: true },
    });

    if (user?.role?.name !== "ADMIN") {
      res.status(403).json({ message: "Forbidden: Admin access required to create channels" });
      return;
    }

    const { campusId, name, slug, description, channelType, isReadOnlyForStudents } = req.body;
    if (!campusId || !name || !slug) {
      res.status(400).json({ message: "campusId, name, and slug are required" });
      return;
    }

    const result = await channelService.createChannel(
      campusId,
      name,
      slug,
      description || null,
      channelType || "GENERAL",
      isReadOnlyForStudents || false,
      userId
    );

    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "CONFLICT" ? 409
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "Channel created successfully",
      channelId: result.data.channelId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create channel" });
  }
};

export const listChannelsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await channelService.listChannels(userId);
    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to list channels" });
  }
};

export const addMemberController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { channelId } = req.params;
    const { userId } = req.body;
    const targetUserId = (userId || actorId) as string;

    const result = await channelService.addMember(channelId as string, targetUserId, actorId as string);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "CONFLICT" ? 409
                       : result.code === "FORBIDDEN" || result.code === "ALUMNI_RESTRICTED" || result.code === "CAMPUS_MISMATCH" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "User added to channel successfully",
      memberId: result.data.memberId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to add member to channel" });
  }
};

export const removeMemberController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { channelId, userId } = req.params;
    const targetUserId = (userId || actorId) as string;

    const result = await channelService.removeMember(channelId as string, targetUserId);
    if (!result.success) {
      res.status(result.code === "NOT_FOUND" ? 404 : 400).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({ message: "Member removed from channel successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to remove member from channel" });
  }
};

export const getMessagesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { channelId } = req.params;
    const { cursor, limit } = req.query;

    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    const result = await channelService.getMessages(
      channelId as string,
      userId,
      cursor ? (cursor as string) : undefined,
      limitNum
    );

    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "FORBIDDEN" || result.code === "ALUMNI_RESTRICTED" || result.code === "CAMPUS_MISMATCH" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to get messages" });
  }
};

export const sendMessageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { channelId } = req.params;
    const { content, parentMessageId } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ message: "content is required" });
      return;
    }

    const result = await channelService.sendMessage(
      channelId as string,
      userId,
      content,
      parentMessageId ? (parentMessageId as string) : undefined
    );

    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "FORBIDDEN" || result.code === "ALUMNI_RESTRICTED" || result.code === "CAMPUS_MISMATCH" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "Message sent successfully",
      messageId: result.data.messageId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to send message" });
  }
};

export const editMessageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ message: "content is required" });
      return;
    }

    const result = await channelService.editMessage(messageId as string, userId, content);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "FORBIDDEN" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({ message: "Message edited successfully", messageId: result.data.messageId });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to edit message" });
  }
};

export const deleteMessageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { messageId } = req.params;

    const result = await channelService.deleteMessage(messageId as string, userId);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "FORBIDDEN" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete message" });
  }
};

export const getThreadRepliesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { messageId } = req.params;
    const { cursor, limit } = req.query;

    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    const result = await channelService.getReplies(
      messageId as string,
      userId,
      cursor ? (cursor as string) : undefined,
      limitNum
    );

    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "FORBIDDEN" || result.code === "ALUMNI_RESTRICTED" || result.code === "CAMPUS_MISMATCH" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to get replies" });
  }
};
