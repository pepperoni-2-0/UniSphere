import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { FeedService } from "../services/FeedService.js";

const feedService = new FeedService();

export const uploadStoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { content, mediaUrl, mediaType } = req.body;

    if (!content && !mediaUrl) {
      res.status(400).json({ message: "Either content or mediaUrl is required for a story" });
      return;
    }

    // Map mediaType check (fallback to TEXT)
    const type: "TEXT" | "IMAGE" | "VIDEO" = 
      mediaType === "IMAGE" || mediaType === "VIDEO" || mediaType === "TEXT" 
        ? mediaType 
        : "TEXT";

    const result = await feedService.createStory(userId, content, mediaUrl, type);

    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "Story uploaded successfully. It will expire in 24 hours.",
      storyId: result.data.storyId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to upload story" });
  }
};

export const getStoriesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await feedService.getStories(userId);

    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({
      stories: result.data.stories,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch stories" });
  }
};
