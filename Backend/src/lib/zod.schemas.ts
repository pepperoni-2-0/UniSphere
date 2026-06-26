import { z } from "zod";

export const registerSchema = z.object({
  officialEmail: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Optionally, the frontend could send the shortName of the campus, but ideally inferred from email.
  // We'll require campusId to simplify for now, or assume standard NST.
  campusId: z.string().uuid("Invalid campus ID").optional(),
});

export const loginSchema = z.object({
  officialEmail: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().min(1, "State token is required"),
});

export const updateStatusSchema = z.object({
  customStatusText: z.string().max(255, "Custom status must be 255 characters or fewer").nullable().optional(),
});

export const updateBioSchema = z.object({
  bio: z.string().max(1000, "Bio must be 1000 characters or fewer").nullable().optional(),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url("Invalid avatar URL format").nullable().optional().or(z.literal("")),
});

