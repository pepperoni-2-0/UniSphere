import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { NotificationTypeEnum } from "@prisma/client";

export const getNotificationsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { unreadOnly } = req.query;

    const whereClause: any = {
      recipientId: userId,
    };

    if (unreadOnly === "true") {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch notifications" });
  }
};

export const markNotificationAsReadController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id: id as string, recipientId: userId },
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id as string },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update notification" });
  }
};

export const markAllNotificationsAsReadController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updateResult = await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({
      message: "All notifications marked as read",
      count: updateResult.count,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update notifications" });
  }
};

export const createNotificationController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { recipientId, type, title, body, entityType, entityId } = req.body;

    if (!recipientId || !type || !title) {
      res.status(400).json({ message: "recipientId, type, and title are required" });
      return;
    }

    // Verify type is valid enum
    if (!Object.values(NotificationTypeEnum).includes(type)) {
      res.status(400).json({ message: `Invalid notification type. Must be one of: ${Object.values(NotificationTypeEnum).join(", ")}` });
      return;
    }

    // Check if recipient exists
    const recipientExists = await prisma.user.findFirst({
      where: { id: recipientId, deletedAt: null },
    });

    if (!recipientExists) {
      res.status(404).json({ message: "Recipient user not found" });
      return;
    }

    const newNotification = await prisma.notification.create({
      data: {
        recipientId,
        senderId: userId,
        type,
        title,
        body,
        entityType,
        entityId,
      },
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create notification" });
  }
};
