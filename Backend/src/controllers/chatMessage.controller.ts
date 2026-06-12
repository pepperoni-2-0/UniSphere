import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

/**
 * Helper to verify user is active participant in the chat
 */
const verifyUserAccessToChat = async (chatId: string, userId: string): Promise<boolean> => {
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId,
      deletedAt: null
    }
  });
  return !!participant;
};

export const sendMessageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ message: "content is required and must be a string." });
      return;
    }

    // Verify chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId, deletedAt: null }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat room not found." });
      return;
    }

    // Verify membership
    const hasAccess = await verifyUserAccessToChat(chatId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden: You are not a participant of this chat" });
      return;
    }

    // Create message and touch parent Chat in a single transaction
    const [newMessage] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          chatId,
          senderId: userId,
          content
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      })
    ]);

    res.status(201).json({
      message: "Message sent successfully",
      message: newMessage
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

    const { chatId, messageId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ message: "content is required and must be a string." });
      return;
    }

    // Verify membership
    const hasAccess = await verifyUserAccessToChat(chatId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden: You are not a participant of this chat" });
      return;
    }

    // Verify message exists and was sent by current user
    const message = await prisma.chatMessage.findFirst({
      where: { id: messageId, chatId, deletedAt: null }
    });

    if (!message) {
      res.status(404).json({ message: "Message not found in this chat room." });
      return;
    }

    if (message.senderId !== userId) {
      res.status(403).json({ message: "Forbidden: You cannot edit another user's message" });
      return;
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content, updatedAt: new Date() },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Message updated successfully",
      message: updatedMessage
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to edit message" });
  }
};

export const getMessagesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { chatId } = req.params;
    const { limit, cursor } = req.query;

    // Verify membership
    const hasAccess = await verifyUserAccessToChat(chatId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden: You are not a participant of this chat" });
      return;
    }

    const limitNum = limit ? parseInt(limit as string, 10) : 50;

    const dbMessages = await prisma.chatMessage.findMany({
      where: {
        chatId,
        deletedAt: null
      },
      take: limitNum + 1, // Fetch an extra message to set cursor
      cursor: cursor ? { id: cursor as string } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    let nextCursor: string | null = null;
    let messagesList = [...dbMessages];

    if (dbMessages.length > limitNum) {
      nextCursor = dbMessages[limitNum].id;
      messagesList = messagesList.slice(0, limitNum);
    }

    // Reverse list so client gets them in standard chronological order (oldest first)
    messagesList.reverse();

    res.status(200).json({
      messages: messagesList,
      nextCursor
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch messages" });
  }
};
