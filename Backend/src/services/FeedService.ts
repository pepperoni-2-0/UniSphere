import { prisma } from '../lib/prisma.js';
import type { ServiceResult, ErrorCode } from '../types/index.js';
import { CreatePostSchema, CreateStorySchema } from '../types/index.js';
import { PostVisibilityEnum, StoryMediaTypeEnum } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types matching the schema structures
// ---------------------------------------------------------------------------

export interface SocialPostWithRelations {
  id: string;
  authorId: string;
  campusId: string;
  content: string;
  visibility: PostVisibilityEnum;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    branch: string | null;
    batch: string | null;
    role: {
      name: string;
    };
  };
  campus: {
    id: string;
    shortName: string;
  };
}

export interface StoryWithRelations {
  id: string;
  authorId: string;
  campusId: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: StoryMediaTypeEnum;
  visibility: PostVisibilityEnum;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

/**
 * FeedService handles all social activity feeds and temporary stories.
 * Enforces visibility scopes (ALL_NST vs CAMPUS_ONLY) and handles soft deletes.
 */
export class FeedService {
  /**
   * Fetch the activity feed for a user, paginated and filtered by visibility.
   *
   * @param userId - The user requesting the feed.
   * @param filter - The visibility filter ('ALL_NST' or 'MY_CAMPUS').
   * @param cursor - Optional post ID to start pagination from.
   * @param limit  - Number of posts to return (default 20, max 50).
   */
  async getFeed(
    userId: string,
    filter: 'ALL_NST' | 'MY_CAMPUS',
    cursor?: string,
    limit: number = 20,
  ): Promise<ServiceResult<{ posts: SocialPostWithRelations[]; nextCursor: string | null }>> {
    try {
      // 1. Fetch user to obtain campus affiliation ──────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Build where filter for visibility & soft delete ──────────────────
      const whereClause: any = {
        deletedAt: null,
      };

      if (filter === 'ALL_NST') {
        whereClause.visibility = PostVisibilityEnum.ALL_NST;
      } else {
        // MY_CAMPUS: Include all ALL_NST posts OR CAMPUS_ONLY posts for the user's primary campus
        whereClause.OR = [
          { visibility: PostVisibilityEnum.ALL_NST },
          {
            visibility: PostVisibilityEnum.CAMPUS_ONLY,
            campusId: user.primaryCampusId,
          },
        ];
      }

      // 3. Query posts with cursor pagination ────────────────────────────────
      // We fetch limit + 1 posts to check if there is a next page
      const posts = await prisma.socialPost.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              branch: true,
              batch: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          campus: {
            select: {
              id: true,
              shortName: true,
            },
          },
        },
      });

      // 4. Determine next cursor ─────────────────────────────────────────────
      let nextCursor: string | null = null;
      let paginatedPosts = posts as unknown as SocialPostWithRelations[];

      if (posts.length > limit) {
        nextCursor = posts[limit].id;
        paginatedPosts = paginatedPosts.slice(0, limit);
      }

      return {
        success: true,
        data: {
          posts: paginatedPosts,
          nextCursor,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new social feed post.
   *
   * @param userId     - Author ID.
   * @param content    - Post body text (1 - 5000 chars).
   * @param visibility - ALL_NST (cross-campus) or CAMPUS_ONLY.
   * @param mediaIds   - Optional list of pre-uploaded media IDs to associate.
   */
  async createPost(
    userId: string,
    content: string,
    visibility: 'ALL_NST' | 'CAMPUS_ONLY',
    mediaIds?: string[],
  ): Promise<ServiceResult<{ postId: string }>> {
    try {
      // 1. Validate payload using Zod ────────────────────────────────────────
      const validation = CreatePostSchema.safeParse({ content, visibility, mediaIds });
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues.map((i) => i.message).join('; '),
          code: 'VALIDATION_ERROR' as ErrorCode,
        };
      }

      // 2. Verify user exists and get campusId ───────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 3. Create post & update media entities in a transaction ──────────────
      const post = await prisma.$transaction(async (tx) => {
        const newPost = await tx.socialPost.create({
          data: {
            authorId: userId,
            campusId: user.primaryCampusId,
            content: content,
            visibility: visibility as PostVisibilityEnum,
          },
        });

        // Link media if provided
        if (mediaIds && mediaIds.length > 0) {
          await tx.media.updateMany({
            where: {
              id: { in: mediaIds },
              uploaderId: userId,
              deletedAt: null,
            },
            data: {
              entityType: 'SOCIAL_POST',
              entityId: newPost.id,
            },
          });
        }

        // Add audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'SOCIAL_POST_CREATED',
            entityType: 'SOCIAL_POST',
            entityId: newPost.id,
            details: {
              visibility,
              mediaCount: mediaIds?.length ?? 0,
            },
          },
        });

        return newPost;
      });

      return {
        success: true,
        data: { postId: post.id },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch active, non-expired stories visible to the user.
   *
   * @param userId - Target user.
   */
  async getStories(userId: string): Promise<ServiceResult<{ stories: StoryWithRelations[] }>> {
    try {
      // 1. Fetch user to get campus ID ───────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Query stories where not expired and visible ───────────────────────
      const stories = await prisma.story.findMany({
        where: {
          deletedAt: null,
          expiresAt: { gt: new Date() },
          OR: [
            { visibility: PostVisibilityEnum.ALL_NST },
            {
              visibility: PostVisibilityEnum.CAMPUS_ONLY,
              campusId: user.primaryCampusId,
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        success: true,
        data: {
          stories: stories as unknown as StoryWithRelations[],
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new temporary story (expires in 24 hours).
   *
   * @param userId    - Story author.
   * @param content   - Optional text content.
   * @param mediaUrl  - Optional media asset URL.
   * @param mediaType - Media type enum (TEXT, IMAGE, VIDEO).
   */
  async createStory(
    userId: string,
    content?: string,
    mediaUrl?: string,
    mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT',
  ): Promise<ServiceResult<{ storyId: string }>> {
    try {
      // 1. Validate payload using Zod ────────────────────────────────────────
      const validation = CreateStorySchema.safeParse({ content, mediaUrl, mediaType });
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues.map((i) => i.message).join('; '),
          code: 'VALIDATION_ERROR' as ErrorCode,
        };
      }

      // 2. Verify user and get campus ────────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 3. Create story row with 24h expiration ──────────────────────────────
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const story = await prisma.$transaction(async (tx) => {
        const newStory = await tx.story.create({
          data: {
            authorId: userId,
            campusId: user.primaryCampusId,
            content: content ?? null,
            mediaUrl: mediaUrl ?? null,
            mediaType: mediaType as StoryMediaTypeEnum,
            visibility: PostVisibilityEnum.CAMPUS_ONLY, // Default stories to Campus only
            expiresAt,
          },
        });

        // Add audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'STORY_CREATED',
            entityType: 'STORY',
            entityId: newStory.id,
            details: {
              mediaType,
              hasText: Boolean(content),
              hasMedia: Boolean(mediaUrl),
            },
          },
        });

        return newStory;
      });

      return {
        success: true,
        data: { storyId: story.id },
      };
    } catch (error) {
      throw error;
    }
  }
}
