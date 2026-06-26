import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { registerUser, loginUser, generateTokens } from "../services/auth.service.js";

const REFRESH_SECRET = process.env.REFRESH_SECRET || "fallback_refresh_secret";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * Handle user registration.
 * Request body is pre-validated by Zod middleware.
 */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = req.body;
    const newUser = await registerUser(validatedData);
    const { accessToken, refreshToken } = generateTokens(newUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.officialEmail,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
};

/**
 * Handle user login.
 * Request body is pre-validated by Zod middleware.
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = req.body;
    const user = await loginUser(validatedData);
    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.officialEmail,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Login failed" });
  }
};

/**
 * Handle user logout.
 */
export const logoutController = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * Handle refresh token exchange.
 */
export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401).json({ message: "No refresh token found" });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as {
      userId: string;
      roleId: string;
      campusId: string;
    };

    const newAccessToken = jwt.sign(
      {
        userId: payload.userId,
        roleId: payload.roleId,
        campusId: payload.campusId,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

/**
 * Initiate Google OAuth Flow.
 * Generates secure state and redirects to Google Authorization URL.
 */
export const googleAuthInitiateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const state = crypto.randomBytes(16).toString("hex");

    // Protects callback endpoint against CSRF attacks
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const clientID = process.env.GOOGLE_CLIENT_ID || "placeholder_client_id";
    const redirectURI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/v1/auth/oauth/google/callback";
    const scopes = ["openid", "email", "profile"].join(" ");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientID)}` +
      `&redirect_uri=${encodeURIComponent(redirectURI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${encodeURIComponent(state)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to initiate Google OAuth" });
  }
};

/**
 * Handle Google OAuth Callback.
 * Validates state token, exchanges code for Google profile data, and signs in user.
 */
export const googleAuthCallbackController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const { oauth_state } = req.cookies;

    if (!oauth_state || state !== oauth_state) {
      res.status(400).json({ message: "CSRF state verification failed." });
      return;
    }

    res.clearCookie("oauth_state");

    // In production, exchange authorization code for Google tokens
    // E.g. POST to https://oauth2.googleapis.com/token
    // Under this scaffold, we simulate/mock this exchange:
    const mockGoogleUser = {
      email: "oauth.user@nst.edu",
      firstName: "OAuth",
      lastName: "User",
    };

    let user = await prisma.user.findUnique({
      where: { officialEmail: mockGoogleUser.email },
    });

    if (!user) {
      // Find or create default Student role
      let role = await prisma.role.findFirst({ where: { name: "STUDENT" } });
      if (!role) {
        role = await prisma.role.findFirst({ where: { name: "Student" } });
      }
      if (!role) {
        role = await prisma.role.create({
          data: { name: "STUDENT", description: "Default Student Role" },
        });
      }

      // Find default Campus
      let campus = await prisma.campus.findFirst();
      if (!campus) {
        campus = await prisma.campus.create({
          data: {
            name: "Default Campus",
            shortName: "Default",
            code: "DEFAULT",
          },
        });
      }

      // Create OAuth authenticated user (no passwordHash required)
      user = await prisma.user.create({
        data: {
          officialEmail: mockGoogleUser.email,
          passwordHash: "", // No password for OAuth users
          firstName: mockGoogleUser.firstName,
          lastName: mockGoogleUser.lastName,
          displayName: `${mockGoogleUser.firstName} ${mockGoogleUser.lastName}`,
          roleId: role.id,
          primaryCampusId: campus.id,
          status: "ACTIVE",
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-success?token=${accessToken}`);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "OAuth callback failed." });
  }
};
