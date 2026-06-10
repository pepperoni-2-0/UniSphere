import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../lib/zod.schemas.js";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "fallback_refresh_secret";

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

export const registerUser = async (data: RegisterData) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { officialEmail: data.officialEmail },
  });

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Fetch or default role (assuming a "Student" role exists)
  let role = await prisma.role.findFirst({ where: { name: "Student" } });
  if (!role) {
    // Fallback if DB is completely empty for some reason
    role = await prisma.role.create({
      data: { name: "Student", description: "Default student role" },
    });
  }

  // Fetch or default campus
  let campusId = data.campusId;
  if (!campusId) {
    const defaultCampus = await prisma.campus.findFirst();
    if (!defaultCampus) {
      throw new Error("No campus found in the system. Please provide a campusId.");
    }
    campusId = defaultCampus.id;
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      officialEmail: data.officialEmail,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      roleId: role.id,
      primaryCampusId: campusId,
    },
  });

  return newUser;
};

export const loginUser = async (data: LoginData) => {
  const user = await prisma.user.findUnique({
    where: { officialEmail: data.officialEmail },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return user;
};

export const generateTokens = (user: { id: string; roleId: string; primaryCampusId: string }) => {
  const payload = {
    userId: user.id,
    roleId: user.roleId,
    campusId: user.primaryCampusId,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};
