import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { UserService } from "../services/UserService.js";

const userService = new UserService();

export const getUserProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await userService.getUserProfile(userId);
    if (!result.success) {
      res.status(404).json({ message: result.error });
      return;
    }

    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch user profile" });
  }
};

export const getUserProfileByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await userService.getUserProfile(id as string);
    if (!result.success) {
      res.status(404).json({ message: result.error });
      return;
    }

    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch user profile" });
  }
};

export const updateCustomStatusController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { customStatusText } = req.body;
    if (customStatusText !== null && typeof customStatusText !== "string") {
      res.status(400).json({ message: "Invalid customStatusText format" });
      return;
    }

    await userService.updateCustomStatus(userId, customStatusText);
    res.status(200).json({ message: "Custom status updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update custom status" });
  }
};

export const updateBioController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { bio } = req.body;
    if (bio !== null && typeof bio !== "string") {
      res.status(400).json({ message: "Invalid bio format" });
      return;
    }

    await userService.updateBio(userId, bio);
    res.status(200).json({ message: "Bio updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update bio" });
  }
};

export const updateAvatarController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { avatarUrl } = req.body;
    if (avatarUrl !== null && typeof avatarUrl !== "string") {
      res.status(400).json({ message: "Invalid avatarUrl format" });
      return;
    }

    await userService.updateAvatar(userId, avatarUrl);
    res.status(200).json({ message: "Avatar updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update avatar" });
  }
};

export const searchDirectoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, campusId } = req.query;
    const queryStr = typeof q === "string" ? q : "";

    const result = await userService.searchDirectory(queryStr, typeof campusId === "string" ? campusId : undefined);
    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to search directory" });
  }
};
