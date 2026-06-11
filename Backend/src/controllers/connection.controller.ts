import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ConnectionService } from "../services/ConnectionService.js";

const connService = new ConnectionService();

export const sendConnectionRequestController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requesterId = req.user?.userId;
    if (!requesterId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { addresseeId } = req.body;
    if (!addresseeId || typeof addresseeId !== "string") {
      res.status(400).json({ message: "addresseeId is required" });
      return;
    }

    const result = await connService.sendRequest(requesterId, addresseeId);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404
                       : result.code === "CONFLICT" ? 409
                       : result.code === "FORBIDDEN" ? 403
                       : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(201).json({
      message: "Connection request sent successfully",
      connectionId: result.data.connectionId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to send connection request" });
  }
};

export const acceptConnectionRequestController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresseeId = req.user?.userId;
    if (!addresseeId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { requesterId } = req.body;
    if (!requesterId || typeof requesterId !== "string") {
      res.status(400).json({ message: "requesterId is required" });
      return;
    }

    const result = await connService.acceptRequest(addresseeId, requesterId);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({ message: "Connection request accepted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to accept connection request" });
  }
};

export const blockUserController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { targetUserId } = req.body;
    if (!targetUserId || typeof targetUserId !== "string") {
      res.status(400).json({ message: "targetUserId is required" });
      return;
    }

    const result = await connService.blockUser(userId, targetUserId);
    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
      res.status(statusCode).json({ message: result.error, code: result.code });
      return;
    }

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to block user" });
  }
};

export const getConnectionsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await connService.getConnections(userId);
    if (!result.success) {
      res.status(400).json({ message: result.error, code: result.code });
      return;
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch connections" });
  }
};
