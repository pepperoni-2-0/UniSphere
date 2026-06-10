/**
 * @module types
 * @description Central type definitions and Zod validation schemas for UniSphere.
 *
 * Re-exports all Prisma-generated enums for convenience, defines Zod schemas
 * for every service-layer input, and provides a discriminated-union
 * `ServiceResult<T>` type used across all service returns.
 */

import { z } from 'zod';

// ─── Re-export Prisma enums ────────────────────────────────────────────────────
export {
  UserStatusEnum as UserStatus,
  PostVisibilityEnum as PostVisibility,
  ConnectionStatusEnum as ConnectionStatus,
  ChannelTypeEnum as ChannelType,
  NotificationTypeEnum as NotificationType,
  ModerationActionEnum as ModerationAction,
  EventScopeEnum as EventScope,
  StoryMediaTypeEnum as StoryMediaType,
  ChatTypeEnum as ChatType,
} from '@prisma/client';

// ─── Error codes ───────────────────────────────────────────────────────────────

/** Canonical error codes returned inside `ServiceResult` failures. */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'CAMPUS_MISMATCH'
  | 'ALUMNI_RESTRICTED'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_TOKEN';

// ─── ServiceResult<T> ─────────────────────────────────────────────────────────

/**
 * Discriminated union for all service-layer return values.
 *
 * @template T - The data payload on success.
 *
 * @example
 * ```ts
 * const result: ServiceResult<User> = await userService.register(input);
 * if (result.success) {
 *   console.log(result.data.id);
 * } else {
 *   console.error(result.code, result.error);
 * }
 * ```
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode };

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

/**
 * Schema for new user registration.
 *
 * - `officialEmail` must be a valid email (typically an `.edu` address).
 * - `password` enforces a minimum length of 8 characters.
 * - `campusCode` identifies the campus the user belongs to.
 * - `branch` and `batch` are optional metadata fields.
 */
export const RegisterUserSchema = z.object({
  officialEmail: z
    .string()
    .email('A valid official email address is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  campusCode: z.string().min(1, 'Campus code is required'),
  branch: z.string().optional(),
  batch: z.string().optional(),
});

/** Schema for email + password login. */
export const LoginSchema = z.object({
  email: z.string().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

/** Schema for adding / updating a personal (non-official) email. */
export const AddPersonalEmailSchema = z.object({
  email: z.string().email('A valid personal email address is required'),
});

/**
 * Schema for creating a social-feed post.
 *
 * - `content` is capped at 5 000 characters to prevent abuse.
 * - `visibility` maps to the Prisma `PostVisibility` enum.
 * - `mediaIds` is an optional array of pre-uploaded media UUIDs.
 */
export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(5000, 'Post content must not exceed 5 000 characters'),
  visibility: z.enum(['ALL_NST', 'CAMPUS_ONLY']),
  mediaIds: z
    .array(z.string().uuid('Each media ID must be a valid UUID'))
    .optional(),
});

/**
 * Schema for creating a story.
 *
 * At least one of `content` or `mediaUrl` must be provided.
 */
export const CreateStorySchema = z
  .object({
    content: z.string().optional(),
    mediaUrl: z.string().url('Media URL must be a valid URL').optional(),
    mediaType: z.enum(['TEXT', 'IMAGE', 'VIDEO']),
  })
  .refine(
    (data) => Boolean(data.content) || Boolean(data.mediaUrl),
    {
      message: 'A story must have either content or a media URL',
      path: ['content'],
    },
  );

/**
 * Schema for querying the social feed.
 *
 * - `filter` decides between a cross-campus or single-campus feed.
 * - Cursor-based pagination keeps the query efficient on large datasets.
 */
export const FeedQuerySchema = z.object({
  filter: z.enum(['ALL_NST', 'MY_CAMPUS']),
  cursor: z.string().uuid('Cursor must be a valid UUID').optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/** Schema for adding a member to an official channel. */
export const AddChannelMemberSchema = z.object({
  channelId: z.string().uuid('Channel ID must be a valid UUID'),
  userId: z.string().uuid('User ID must be a valid UUID'),
});

/** Schema for sending a message in an official channel. */
export const SendMessageSchema = z.object({
  channelId: z.string().uuid('Channel ID must be a valid UUID'),
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(10000, 'Message content must not exceed 10 000 characters'),
});

/** Generic cursor-based pagination parameters. */
export const PaginationSchema = z.object({
  cursor: z.string().uuid('Cursor must be a valid UUID').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Inferred TypeScript types ─────────────────────────────────────────────────

/** Input type for user registration. */
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

/** Input type for login. */
export type LoginInput = z.infer<typeof LoginSchema>;

/** Input type for adding a personal email. */
export type AddPersonalEmailInput = z.infer<typeof AddPersonalEmailSchema>;

/** Input type for creating a social post. */
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

/** Input type for creating a story. */
export type CreateStoryInput = z.infer<typeof CreateStorySchema>;

/** Input type for querying the feed. */
export type FeedQueryInput = z.infer<typeof FeedQuerySchema>;

/** Input type for adding a channel member. */
export type AddChannelMemberInput = z.infer<typeof AddChannelMemberSchema>;

/** Input type for sending a channel message. */
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

/** Generic pagination input. */
export type PaginationInput = z.infer<typeof PaginationSchema>;
