import { prisma } from '../lib/prisma.js';
import type { ServiceResult, ErrorCode } from '../types/index.js';

export class ConnectionService {
  async sendRequest(requesterId: string, addresseeId: string): Promise<ServiceResult<{ connectionId: string }>> {
    try {
      if (requesterId === addresseeId) {
        return {
          success: false,
          error: 'You cannot connect with yourself',
          code: 'VALIDATION_ERROR' as ErrorCode,
        };
      }

      // Check if addressee exists
      const targetUser = await prisma.user.findFirst({
        where: { id: addresseeId, deletedAt: null },
      });
      if (!targetUser) {
        return {
          success: false,
          error: 'Target user not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // Check if connection already exists in either direction
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId, addresseeId },
            { requesterId: addresseeId, addresseeId: requesterId },
          ],
        },
      });

      if (existing) {
        if (existing.status === 'ACCEPTED') {
          return {
            success: false,
            error: 'You are already connected with this user',
            code: 'CONFLICT' as ErrorCode,
          };
        }
        if (existing.status === 'PENDING') {
          return {
            success: false,
            error: 'A connection request is already pending',
            code: 'CONFLICT' as ErrorCode,
          };
        }
        if (existing.status === 'BLOCKED') {
          return {
            success: false,
            error: 'Connection is blocked',
            code: 'FORBIDDEN' as ErrorCode,
          };
        }
      }

      // Create connection request
      const conn = await prisma.connection.create({
        data: {
          requesterId,
          addresseeId,
          status: 'PENDING',
        },
      });

      return { success: true, data: { connectionId: conn.id } };
    } catch (error) {
      throw error;
    }
  }

  async acceptRequest(addresseeId: string, requesterId: string): Promise<ServiceResult<{ accepted: boolean }>> {
    try {
      const conn = await prisma.connection.findFirst({
        where: {
          requesterId,
          addresseeId,
          status: 'PENDING',
        },
      });

      if (!conn) {
        return {
          success: false,
          error: 'No pending connection request found from this user',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      await prisma.connection.update({
        where: { id: conn.id },
        data: { status: 'ACCEPTED' },
      });

      return { success: true, data: { accepted: true } };
    } catch (error) {
      throw error;
    }
  }

  async blockUser(userId: string, targetUserId: string): Promise<ServiceResult<{ blocked: boolean }>> {
    try {
      if (userId === targetUserId) {
        return {
          success: false,
          error: 'You cannot block yourself',
          code: 'VALIDATION_ERROR' as ErrorCode,
        };
      }

      // Check if target user exists
      const targetUser = await prisma.user.findFirst({
        where: { id: targetUserId, deletedAt: null },
      });
      if (!targetUser) {
        return {
          success: false,
          error: 'Target user not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // Delete any existing connections in either direction, then create a blocked connection
      await prisma.$transaction([
        prisma.connection.deleteMany({
          where: {
            OR: [
              { requesterId: userId, addresseeId: targetUserId },
              { requesterId: targetUserId, addresseeId: userId },
            ],
          },
        }),
        prisma.connection.create({
          data: {
            requesterId: userId,
            addresseeId: targetUserId,
            status: 'BLOCKED',
          },
        }),
      ]);

      return { success: true, data: { blocked: true } };
    } catch (error) {
      throw error;
    }
  }

  async getConnections(userId: string): Promise<ServiceResult<{
    connections: any[];
    incomingRequests: any[];
    outgoingRequests: any[];
  }>> {
    try {
      const allConns = await prisma.connection.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { addresseeId: userId },
          ],
          status: { in: ['ACCEPTED', 'PENDING'] },
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              avatarUrl: true,
              branch: true,
              batch: true,
              bio: true,
              customStatusText: true,
            },
          },
          addressee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              avatarUrl: true,
              branch: true,
              batch: true,
              bio: true,
              customStatusText: true,
            },
          },
        },
      });

      const connections: any[] = [];
      const incomingRequests: any[] = [];
      const outgoingRequests: any[] = [];

      for (const conn of allConns) {
        if (conn.status === 'ACCEPTED') {
          // Add the other party
          if (conn.requesterId === userId) {
            connections.push(conn.addressee);
          } else {
            connections.push(conn.requester);
          }
        } else if (conn.status === 'PENDING') {
          if (conn.requesterId === userId) {
            outgoingRequests.push(conn.addressee);
          } else {
            incomingRequests.push(conn.requester);
          }
        }
      }

      return {
        success: true,
        data: {
          connections,
          incomingRequests,
          outgoingRequests,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
