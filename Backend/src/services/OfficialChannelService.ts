import { prisma } from '../lib/prisma.js';
import type { ServiceResult, ErrorCode } from '../types/index.js';
import { validateCampusAccess } from '../middleware/campusIsolation.js';
import { ChannelTypeEnum } from '@prisma/client';

// ---------------------------------------------------------------------------
// Custom Types
// ---------------------------------------------------------------------------

export interface OfficialChannelWithMemberCount {
  id: string;
  campusId: string;
  name: string;
  slug: string;
  description: string | null;
  channelType: ChannelTypeEnum;
  isReadOnlyForStudents: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count: {
    members: number;
  };
}

export interface OfficialMessageWithRepliesCount {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  parentMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  _count: {
    replies: number;
  };
}

/**
 * OfficialChannelService manages channel access, membership, and academic messaging.
 * Enforces campus isolation rules and blocks alumni from accessing official spaces.
 */
export class OfficialChannelService {
  /**
   * Add a user to an official campus channel.
   * Performs alumni checks, campus match validation, and reactivates soft-deleted memberships.
   *
   * @param channelId - Target official channel.
   * @param userId - Target user.
   * @param addedById - Optional operator user ID (e.g. an admin adding a user).
   */
  async addMember(
    channelId: string,
    userId: string,
    addedById?: string,
  ): Promise<ServiceResult<{ memberId: string }>> {
    try {
      // 1. Fetch target user and verify not deleted ─────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { role: true },
      });

      if (!user) {
        return {
          success: false,
          error: 'Target user not found or has been deleted',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Reject alumni role unconditionally ───────────────────────────────
      if (user.role.name === 'ALUMNI') {
        return {
          success: false,
          error: 'Alumni are not permitted to join or access official channels',
          code: 'ALUMNI_RESTRICTED' as ErrorCode,
        };
      }

      // 3. Fetch target channel and verify not deleted ──────────────────────
      const channel = await prisma.officialChannel.findFirst({
        where: { id: channelId, deletedAt: null },
      });

      if (!channel) {
        return {
          success: false,
          error: 'Target channel not found or has been deleted',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 4. Validate campus access (middleware logic duplication safety check) ──
      const campusCheck = await validateCampusAccess(prisma, userId, channelId);
      if (!campusCheck.valid) {
        return {
          success: false,
          error: campusCheck.error || 'Campus access denied',
          code: 'CAMPUS_MISMATCH' as ErrorCode,
        };
      }

      // 5. Check if a membership already exists ──────────────────────────────
      const existingMember = await prisma.channelMember.findFirst({
        where: { channelId, userId },
      });

      const memberId = await prisma.$transaction(async (tx) => {
        let activeMemberId: string;

        if (existingMember) {
          if (existingMember.deletedAt === null) {
            // Already active member
            throw new Error('USER_ALREADY_MEMBER');
          } else {
            // Reactivate membership (was soft-deleted)
            const updated = await tx.channelMember.update({
              where: { id: existingMember.id },
              data: {
                deletedAt: null,
                joinedAt: new Date(),
              },
            });
            activeMemberId = updated.id;
          }
        } else {
          // Create new membership row
          const created = await tx.channelMember.create({
            data: {
              channelId,
              userId,
            },
          });
          activeMemberId = created.id;
        }

        // 6. Create Audit Log
        await tx.auditLog.create({
          data: {
            actorId: addedById ?? userId,
            action: 'CHANNEL_MEMBER_ADDED',
            entityType: 'OFFICIAL_CHANNEL',
            entityId: channelId,
            details: {
              userId,
              joinedMemberId: activeMemberId,
              reactivated: Boolean(existingMember),
            },
          },
        });

        return activeMemberId;
      });

      return { success: true, data: { memberId } };
    } catch (error: any) {
      if (error.message === 'USER_ALREADY_MEMBER') {
        return {
          success: false,
          error: 'User is already an active member of this channel',
          code: 'CONFLICT' as ErrorCode,
        };
      }
      throw error;
    }
  }

  /**
   * Remove a user from an official channel (soft-delete membership).
   *
   * @param channelId - Target channel.
   * @param userId - Target user.
   */
  async removeMember(
    channelId: string,
    userId: string,
  ): Promise<ServiceResult<{ removed: boolean }>> {
    try {
      // 1. Check for active membership ───────────────────────────────────────
      const member = await prisma.channelMember.findFirst({
        where: { channelId, userId, deletedAt: null },
      });

      if (!member) {
        return {
          success: false,
          error: 'Active membership not found for this user in the channel',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Perform soft delete ───────────────────────────────────────────────
      await prisma.$transaction(async (tx) => {
        await tx.channelMember.update({
          where: { id: member.id },
          data: { deletedAt: new Date() },
        });

        // Add audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'CHANNEL_MEMBER_REMOVED',
            entityType: 'OFFICIAL_CHANNEL',
            entityId: channelId,
            details: {
              userId,
              membershipId: member.id,
            },
          },
        });
      });

      return { success: true, data: { removed: true } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * List all official channels belonging to a user's campus.
   * Returns an empty list if the user has ALUMNI status.
   *
   * @param userId - Requesting user.
   */
  async listChannels(
    userId: string,
  ): Promise<ServiceResult<{ channels: OfficialChannelWithMemberCount[] }>> {
    try {
      // 1. Fetch user to get primaryCampusId and role ────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { role: true },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Alumni have no access to official channels ───────────────────────
      if (user.role.name === 'ALUMNI') {
        return { success: true, data: { channels: [] } };
      }

      // 3. Query all official channels under the user's primary campus ────────
      const channels = await prisma.officialChannel.findMany({
        where: {
          campusId: user.primaryCampusId,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              members: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: [{ channelType: 'asc' }, { name: 'asc' }],
      });

      return {
        success: true,
        data: {
          channels: channels as unknown as OfficialChannelWithMemberCount[],
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch top-level official messages inside a channel (cursor-based pagination).
   * Enforces role-based checks and campus mismatch blocks.
   *
   * @param channelId - Target channel.
   * @param userId - Requesting user.
   * @param cursor - Message UUID cursor.
   * @param limit - Count of records to fetch.
   */
  async getMessages(
    channelId: string,
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<ServiceResult<{ messages: OfficialMessageWithRepliesCount[]; nextCursor: string | null }>> {
    try {
      // 1. Check user and restrict alumni ────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { role: true },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      if (user.role.name === 'ALUMNI') {
        return {
          success: false,
          error: 'Alumni are not allowed to query official channel messages',
          code: 'ALUMNI_RESTRICTED' as ErrorCode,
        };
      }

      // 2. Validate campus mismatch ──────────────────────────────────────────
      const campusCheck = await validateCampusAccess(prisma, userId, channelId);
      if (!campusCheck.valid) {
        return {
          success: false,
          error: campusCheck.error || 'Campus access denied',
          code: 'CAMPUS_MISMATCH' as ErrorCode,
        };
      }

      // 3. Query top-level messages (parentMessageId is null) ────────────────
      const messages = await prisma.officialMessage.findMany({
        where: {
          channelId,
          parentMessageId: null,
          deletedAt: null,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              replies: {
                where: { deletedAt: null },
              },
            },
          },
        },
      });

      // 4. Handle pagination next cursor ─────────────────────────────────────
      let nextCursor: string | null = null;
      let paginatedMessages = messages as unknown as OfficialMessageWithRepliesCount[];

      if (messages.length > limit) {
        nextCursor = messages[limit].id;
        paginatedMessages = paginatedMessages.slice(0, limit);
      }

      return {
        success: true,
        data: {
          messages: paginatedMessages,
          nextCursor,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a new message to an official channel.
   * Validates sender role, membership status, and read-only constraints for students.
   *
   * @param channelId - Target channel.
   * @param userId - Sending user ID.
   * @param content - Message content.
   */
  async sendMessage(
    channelId: string,
    userId: string,
    content: string,
  ): Promise<ServiceResult<{ messageId: string }>> {
    try {
      // 1. Fetch user and check alumni ───────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { role: true },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      if (user.role.name === 'ALUMNI') {
        return {
          success: false,
          error: 'Alumni are not allowed to post in official channels',
          code: 'ALUMNI_RESTRICTED' as ErrorCode,
        };
      }

      // 2. Fetch channel and validate campus access ──────────────────────────
      const channel = await prisma.officialChannel.findFirst({
        where: { id: channelId, deletedAt: null },
      });

      if (!channel) {
        return {
          success: false,
          error: 'Channel not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      if (user.primaryCampusId !== channel.campusId) {
        return {
          success: false,
          error: 'Cannot post messages to a different campus channel',
          code: 'CAMPUS_MISMATCH' as ErrorCode,
        };
      }

      // 3. Verify user is an active member ───────────────────────────────────
      const member = await prisma.channelMember.findFirst({
        where: { channelId, userId, deletedAt: null },
      });

      if (!member) {
        return {
          success: false,
          error: 'You must be a member of this channel to post messages',
          code: 'FORBIDDEN' as ErrorCode,
        };
      }

      // 4. Enforce read-only constraint for Student role ─────────────────────
      if (channel.isReadOnlyForStudents && user.role.name === 'STUDENT') {
        return {
          success: false,
          error: 'Students are not authorized to post in this announcements channel',
          code: 'FORBIDDEN' as ErrorCode,
        };
      }

      // 5. Create message ────────────────────────────────────────────────────
      const messageId = await prisma.$transaction(async (tx) => {
        const msg = await tx.officialMessage.create({
          data: {
            channelId,
            senderId: userId,
            content,
          },
        });

        // Add audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'OFFICIAL_MESSAGE_SENT',
            entityType: 'OFFICIAL_CHANNEL',
            entityId: channelId,
            details: {
              messageId: msg.id,
              contentLength: content.length,
            },
          },
        });

        return msg.id;
      });

      return { success: true, data: { messageId } };
    } catch (error) {
      throw error;
    }
  }
}
