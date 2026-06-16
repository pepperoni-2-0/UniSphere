import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  uploadMediaController,
  getMediaController,
  deleteMediaController,
} from "../controllers/media.controller.js";

const router = Router();

router.use(authenticateJWT);

router.post("/upload", uploadMediaController);
router.get("/:id", getMediaController);
router.delete("/:id", deleteMediaController);

export default router;
