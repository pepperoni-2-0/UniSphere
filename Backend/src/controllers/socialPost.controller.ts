import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { FeedService } from "../services/FeedService.js";
import { prisma } from "../lib/prisma.js";

const feedService = new FeedService();

// High-fidelity in-memory stores for likes and comments mapping (since DB doesn't have tables for comments/likes)
const likesMap = new Map<string, Set<string>>(); // postId -> Set of userIds
const commentsMap = new Map<string, any[]>(); // postId -> array of comment objects

export const createPostController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { content, visibility, mediaIds } = req.body;
    if (!content) {
      res.status(400).json({ message: "content is required" });
      return;
    }

    // Default visibility to CAMPUS_ONLY
    const postVisibility = visibility === "ALL_NST" ? "ALL_NST" : "CAMPUS_ONLY";

    const result = await feedService.createPost(userId, content, postVisibility, mediaIds);

    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "Post created successfully",
      postId: result.data.postId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create post" });
  }
};

export const getFeedController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { scope, cursor, limit } = req.query;
    // Map query 'scope' to FeedService 'filter'
    const filter = scope === "all" ? "ALL_NST" : "MY_CAMPUS";
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    const result = await feedService.getFeed(
      userId,
      filter,
      cursor ? (cursor as string) : undefined,
      limitNum
    );

    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }

    // Append mock comments/likes info to returned posts
    const enrichedPosts = result.data.posts.map(post => {
      const likes = likesMap.get(post.id) || new Set<string>();
      const comments = commentsMap.get(post.id) || [];
      return {
        ...post,
        likesList: Array.from(likes),
        commentsList: comments,
        isLikedByUser: likes.has(userId)
      };
    });

    res.status(200).json({
      posts: enrichedPosts,
      nextCursor: result.data.nextCursor
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch feed" });
  }
};

export const likePostController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // Check if post exists
    const post = await prisma.socialPost.findUnique({
      where: { id, deletedAt: null }
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (!likesMap.has(id)) {
      likesMap.set(id, new Set<string>());
    }

    const likesSet = likesMap.get(id)!;
    let isLiked = false;

    if (likesSet.has(userId)) {
      likesSet.delete(userId);
      // Decrement in database
      await prisma.socialPost.update({
        where: { id },
        data: { likesCount: { decrement: 1 } }
      });
    } else {
      likesSet.add(userId);
      isLiked = true;
      // Increment in database
      await prisma.socialPost.update({
        where: { id },
        data: { likesCount: { increment: 1 } }
      });
    }

    res.status(200).json({
      message: isLiked ? "Post liked successfully" : "Post unliked successfully",
      likesCount: likesSet.size,
      isLiked
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to like post" });
  }
};

export const addCommentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({ message: "text is required" });
      return;
    }

    // Check if post exists
    const post = await prisma.socialPost.findUnique({
      where: { id, deletedAt: null }
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Get user details for comments info
    const user = await prisma.user.findFirst({
      where: { id: userId }
    });

    if (!commentsMap.has(id)) {
      commentsMap.set(id, []);
    }

    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username: user ? `${user.firstName} ${user.lastName}` : "Unknown Student",
      avatarUrl: user?.avatarUrl || null,
      text,
      createdAt: new Date().toISOString()
    };

    commentsMap.get(id)!.push(newComment);

    // Update in database
    await prisma.socialPost.update({
      where: { id },
      data: { commentsCount: { increment: 1 } }
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to add comment" });
  }
};
