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

export const listRolesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to list roles" });
  }
};

export const createRoleController = async (
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

    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: "Role name is required" });
      return;
    }

    // Role names are upper case by convention
    const normalizedName = name.trim().toUpperCase();

    // Check if role already exists
    const existingRole = await prisma.role.findFirst({
      where: { name: normalizedName },
    });

    if (existingRole) {
      res.status(409).json({ message: `Role ${normalizedName} already exists` });
      return;
    }

    const newRole = await prisma.role.create({
      data: {
        name: normalizedName,
        description,
      },
    });

    res.status(201).json({
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create role" });
  }
};

export const assignRoleController = async (
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

    const { targetUserId, roleId, roleName } = req.body;

    if (!targetUserId) {
      res.status(400).json({ message: "targetUserId is required" });
      return;
    }

    // Find the target user
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!targetUser) {
      res.status(404).json({ message: "Target user not found" });
      return;
    }

    // Find the role either by roleId or roleName
    let role;
    if (roleId) {
      role = await prisma.role.findUnique({
        where: { id: roleId },
      });
    } else if (roleName) {
      role = await prisma.role.findUnique({
        where: { name: roleName.toUpperCase() },
      });
    }

    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    // Assign role to user
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { roleId: role.id },
      select: {
        id: true,
        displayName: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log this administrative action to the Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "ROLE_ASSIGNMENT",
        entityType: "USER",
        entityId: targetUserId,
        details: {
          assignedRoleId: role.id,
          assignedRoleName: role.name,
        },
        ipAddress: req.ip || null,
      },
    });

    res.status(200).json({
      message: "Role assigned successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to assign role" });
  }
};
