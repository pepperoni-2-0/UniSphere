import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { ChatTypeEnum } from "@prisma/client";

export const createChatController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { isGroup, name, participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      res.status(400).json({ message: "A list of participantIds is required." });
      return;
    }

    const isGroupBool = isGroup === true || isGroup === "true";
    
    // De-duplicate final participant IDs
    const finalParticipants = Array.from(new Set([userId, ...participantIds]));

    // If it's a 1-on-1 direct message, search for an existing DM between these two users
    if (!isGroupBool && finalParticipants.length === 2) {
      const existingDm = await prisma.chat.findFirst({
        where: {
          chatType: ChatTypeEnum.DIRECT,
          deletedAt: null,
          AND: [
            { participants: { some: { userId: finalParticipants[0] } } },
            { participants: { some: { userId: finalParticipants[1] } } }
          ]
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      });

      // Confirm it has exactly 2 participants to verify it's a 1-on-1 DM
      if (existingDm) {
        const participantCount = await prisma.chatParticipant.count({
          where: { chatId: existingDm.id, deletedAt: null }
        });

        if (participantCount === 2) {
          res.status(200).json({
            message: "Direct message room already exists",
            chat: existingDm
          });
          return;
        }
      }
    }

    const defaultName = isGroupBool 
      ? `Group Chat (${finalParticipants.length} members)`
      : "Direct Message";

    // Create chat room and add participants in a single transaction
    const newChat = await prisma.chat.create({
      data: {
        chatType: isGroupBool ? ChatTypeEnum.GROUP : ChatTypeEnum.DIRECT,
        name: name || defaultName,
        createdById: userId,
        participants: {
          create: finalParticipants.map(pid => ({
            userId: pid
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: `${isGroupBool ? "Group chat" : "Direct message room"} created successfully`,
      chat: newChat
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create chat" });
  }
};

export const getUserChatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Retrieve chats where the requesting user is listed as a participant
    const chats = await prisma.chat.findMany({
      where: {
        deletedAt: null,
        participants: {
          some: {
            userId,
            deletedAt: null
          }
        }
      },
      include: {
        participants: {
          where: {
            deletedAt: null
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                customStatusText: true
              }
            }
          }
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1, // Include the most recent message
          include: {
            sender: {
              select: {
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.status(200).json({
      chats
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch chats" });
  }
};

export const manageParticipantsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params; // Chat ID
    const { action, userId: targetUserId } = req.body;

    if (!action || !["add", "remove"].includes(action)) {
      res.status(400).json({ message: 'Action is required and must be "add" or "remove".' });
      return;
    }

    if (!targetUserId) {
      res.status(400).json({ message: "target userId is required." });
      return;
    }

    // Check if chat exists
    const chat = await prisma.chat.findUnique({
      where: { id, deletedAt: null },
      include: {
        participants: {
          where: { deletedAt: null }
        }
      }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Check if request actor is a participant
    const isParticipant = chat.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      res.status(403).json({ message: "Forbidden: You are not a member of this chat room" });
      return;
    }

    if (chat.chatType !== ChatTypeEnum.GROUP) {
      res.status(400).json({ message: "Cannot modify participants of a 1-on-1 direct message." });
      return;
    }

    const targetParticipant = chat.participants.find(p => p.userId === targetUserId);

    if (action === "add") {
      if (targetParticipant) {
        res.status(400).json({ message: "User is already a participant of this chat." });
        return;
      }

      await prisma.chatParticipant.create({
        data: {
          chatId: id,
          userId: targetUserId
        }
      });
    } else {
      // action === "remove"
      if (!targetParticipant) {
        res.status(400).json({ message: "User is not a participant of this chat." });
        return;
      }

      // Perform soft delete or delete on the participant row
      await prisma.chatParticipant.delete({
        where: { id: targetParticipant.id }
      });
    }

    // Return the updated chat room details
    const updatedChat = await prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      message: `Participant successfully ${action}ed`,
      chat: updatedChat
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to manage participants" });
  }
};
