import { prisma } from '../lib/prisma.js';
import type { ServiceResult, ErrorCode } from '../types/index.js';

export class UserService {
  async getUserProfile(userId: string): Promise<ServiceResult<any>> {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: {
          role: true,
          primaryCampus: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      const { passwordHash, ...profile } = user;
      return { success: true, data: profile };
    } catch (error) {
      throw error;
    }
  }

  async updateCustomStatus(userId: string, customStatusText: string | null): Promise<ServiceResult<{ updated: boolean }>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { customStatusText },
      });
      return { success: true, data: { updated: true } };
    } catch (error) {
      throw error;
    }
  }

  async updateBio(userId: string, bio: string | null): Promise<ServiceResult<{ updated: boolean }>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { bio },
      });
      return { success: true, data: { updated: true } };
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(userId: string, avatarUrl: string | null): Promise<ServiceResult<{ updated: boolean }>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });
      return { success: true, data: { updated: true } };
    } catch (error) {
      throw error;
    }
  }

  async searchDirectory(query: string, campusId?: string): Promise<ServiceResult<{ users: any[] }>> {
    try {
      const searchConditions: any[] = [
        { displayName: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { branch: { contains: query, mode: 'insensitive' } },
        { batch: { contains: query, mode: 'insensitive' } },
      ];

      const whereClause: any = {
        deletedAt: null,
        OR: searchConditions,
      };

      if (campusId) {
        whereClause.primaryCampusId = campusId;
      }

      const users = await prisma.user.findMany({
        where: whereClause,
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
          primaryCampusId: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { displayName: 'asc' },
      });

      return { success: true, data: { users } };
    } catch (error) {
      throw error;
    }
  }

  async getAlumniDirectory(campusId?: string): Promise<ServiceResult<{ alumni: any[] }>> {
    try {
      const whereClause: any = {
        deletedAt: null,
        role: {
          name: 'ALUMNI',
        },
      };

      if (campusId) {
        whereClause.primaryCampusId = campusId;
      }

      const alumni = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          displayName: true,
          avatarUrl: true,
          branch: true,
          batch: true,
          bio: true,
          primaryCampusId: true,
          primaryCampus: {
            select: {
              name: true,
              shortName: true,
            },
          },
        },
        orderBy: { displayName: 'asc' },
      });

      return { success: true, data: { alumni } };
    } catch (error) {
      throw error;
    }
  }
}
