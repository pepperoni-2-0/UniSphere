import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  uploadStoryController,
  getStoriesController
} from "../controllers/story.controller.js";

const router = Router();

// Secure all story routes
router.use(authenticateJWT);

router.post("/", uploadStoryController);
router.get("/", getStoriesController);

export default router;
