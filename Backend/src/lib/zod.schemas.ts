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
