import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  createPostController,
  getFeedController,
  likePostController,
  addCommentController
} from "../controllers/socialPost.controller.js";

const router = Router();

// Secure all feed routes
router.use(authenticateJWT);

router.post("/", createPostController);
router.get("/", getFeedController);
router.post("/:id/like", likePostController);
router.post("/:id/comments", addCommentController);

export default router;
