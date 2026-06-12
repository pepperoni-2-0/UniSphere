import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  sendMessageController,
  editMessageController,
  getMessagesController
} from "../controllers/chatMessage.controller.js";

// mergeParams: true allows inheriting chatId param from the parent router
const router = Router({ mergeParams: true });

// Secure all chat message routes
router.use(authenticateJWT);

router.post("/", sendMessageController);
router.put("/:messageId", editMessageController);
router.get("/", getMessagesController);

export default router;
