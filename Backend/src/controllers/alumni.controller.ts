import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { AuthService } from "../services/AuthService.js";
import { UserService } from "../services/UserService.js";

const authService = new AuthService();
const userService = new UserService();

export const transitionToAlumniController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { targetUserId } = req.body;
    const userIdToTransition = targetUserId || actorId;

    const result = await authService.transitionToAlumni(userIdToTransition);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "FORBIDDEN" ? 403
                       : result.code === "EMAIL_NOT_VERIFIED" ? 400
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({
      message: "Graduation transition completed successfully",
      transitionId: result.data.transitionId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to complete transition" });
  }
};

export const getAlumniDirectoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campusId } = req.query;
    const result = await userService.getAlumniDirectory(typeof campusId === "string" ? campusId : undefined);
    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch alumni directory" });
  }
};
