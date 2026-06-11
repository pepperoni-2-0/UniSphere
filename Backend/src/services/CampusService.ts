import { prisma } from '../lib/prisma.js';
import type { ServiceResult, ErrorCode } from '../types/index.js';

export class CampusService {
  async listCampuses(): Promise<ServiceResult<{ campuses: any[] }>> {
    try {
      const campuses = await prisma.campus.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });
      return { success: true, data: { campuses } };
    } catch (error) {
      throw error;
    }
  }

  async getCampusDetails(campusId: string): Promise<ServiceResult<any>> {
    try {
      const campus = await prisma.campus.findFirst({
        where: { id: campusId, deletedAt: null },
      });

      if (!campus) {
        return {
          success: false,
          error: 'Campus not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      return { success: true, data: campus };
    } catch (error) {
      throw error;
    }
  }

  async createCampus(
    name: string,
    shortName: string,
    code: string,
    logoUrl?: string | null
  ): Promise<ServiceResult<{ campusId: string }>> {
    try {
      // Check duplicate code
      const existing = await prisma.campus.findUnique({
        where: { code },
      });

      if (existing) {
        if (existing.deletedAt === null) {
          return {
            success: false,
            error: 'Campus code already exists',
            code: 'CONFLICT' as ErrorCode,
          };
        } else {
          // Reactivate soft-deleted campus
          const updated = await prisma.campus.update({
            where: { id: existing.id },
            data: {
              name,
              shortName,
              logoUrl: logoUrl ?? null,
              deletedAt: null,
            },
          });
          return { success: true, data: { campusId: updated.id } };
        }
      }

      const campus = await prisma.campus.create({
        data: {
          name,
          shortName,
          code,
          logoUrl: logoUrl ?? null,
        },
      });

      return { success: true, data: { campusId: campus.id } };
    } catch (error) {
      throw error;
    }
  }
}
