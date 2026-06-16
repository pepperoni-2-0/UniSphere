import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

// Mock upload function to represent file storage (e.g. S3 / GCS)
const uploadToStorageBucket = async (
  filename: string,
  mimeType: string
): Promise<string> => {
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, "_");
  return `https://storage.googleapis.com/unisphere-bucket/uploads/${uniqueId}_${sanitizedFilename}`;
};

export const uploadMediaController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { entityType, entityId, mimeType, fileSizeBytes, originalFilename } = req.body;

    if (!entityType || !entityId || !mimeType || !originalFilename) {
      res.status(400).json({
        message: "entityType, entityId, mimeType, and originalFilename are required",
      });
      return;
    }

    // Mock upload to bucket
    const url = await uploadToStorageBucket(originalFilename, mimeType);

    // Save metadata in database
    const media = await prisma.media.create({
      data: {
        uploaderId: userId,
        entityType,
        entityId,
        url,
        mimeType,
        fileSizeBytes: fileSizeBytes ? BigInt(fileSizeBytes) : null,
        originalFilename,
      },
    });

    res.status(201).json({
      message: "Media uploaded and tracked successfully",
      media: {
        ...media,
        fileSizeBytes: media.fileSizeBytes ? Number(media.fileSizeBytes) : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to upload media" });
  }
};

export const getMediaController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findFirst({
      where: { id: id as string, deletedAt: null },
    });

    if (!media) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    res.status(200).json({
      ...media,
      fileSizeBytes: media.fileSizeBytes ? Number(media.fileSizeBytes) : null,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch media details" });
  }
};

export const deleteMediaController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const media = await prisma.media.findFirst({
      where: { id: id as string, deletedAt: null },
    });

    if (!media) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    // Access control: only the uploader or an admin can delete the media tracking
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { role: true },
    });

    if (media.uploaderId !== userId && user?.role?.name !== "ADMIN") {
      res.status(403).json({ message: "Forbidden: You cannot delete this media" });
      return;
    }

    // Soft delete
    await prisma.media.update({
      where: { id: id as string },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Media tracking deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete media" });
  }
};
