import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { CampusService } from "../services/CampusService.js";
import { prisma } from "../lib/prisma.js";

const campusService = new CampusService();

export const listCampusesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await campusService.listCampuses();
    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to list campuses" });
  }
};

export const getCampusDetailsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await campusService.getCampusDetails(id as string);
    if (!result.success) {
      res.status(404).json({ message: result.error });
      return;
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch campus details" });
  }
};

export const createCampusController = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(403).json({ message: "Forbidden: Admin access required" });
      return;
    }

    const { name, shortName, code, logoUrl } = req.body;
    if (!name || !shortName || !code) {
      res.status(400).json({ message: "name, shortName, and code are required" });
      return;
    }

    const result = await campusService.createCampus(name, shortName, code, logoUrl);
    if (!result.success) {
      res.status(result.code === "CONFLICT" ? 409 : 400).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "Campus created successfully",
      campusId: result.data.campusId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create campus" });
  }
};
