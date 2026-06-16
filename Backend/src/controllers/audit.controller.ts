import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

// Helper to check if current user is admin
const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { role: true },
  });
  return user?.role?.name === "ADMIN";
};

export const listAuditLogsController = async (
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

    const { actorId, action, entityType, entityId } = req.query;

    const whereClause: any = {};

    if (actorId && typeof actorId === "string") {
      whereClause.actorId = actorId;
    }
    if (action && typeof action === "string") {
      whereClause.action = action;
    }
    if (entityType && typeof entityType === "string") {
      whereClause.entityType = entityType;
    }
    if (entityId && typeof entityId === "string") {
      whereClause.entityId = entityId;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        actor: {
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

    res.status(200).json(auditLogs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to list audit logs" });
  }
};
