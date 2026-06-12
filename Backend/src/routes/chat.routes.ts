import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  createChatController,
  getUserChatsController,
  manageParticipantsController
} from "../controllers/chat.controller.js";

const router = Router();

// Secure all chat routes
router.use(authenticateJWT);

router.post("/", createChatController);
router.get("/", getUserChatsController);
router.post("/:id/participants", manageParticipantsController);

export default router;
