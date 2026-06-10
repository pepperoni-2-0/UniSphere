import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roleId: string;
    campusId: string;
  };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
      }

      req.user = user as AuthRequest["user"];
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized: Missing token" });
  }
};
