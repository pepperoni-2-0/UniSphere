import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  createChannelController,
  listChannelsController,
  addMemberController,
  removeMemberController,
  getMessagesController,
  sendMessageController,
  editMessageController,
  deleteMessageController,
  getThreadRepliesController,
} from "../controllers/channel.controller.js";

const router = Router();

router.use(authenticateJWT);

// Channel routes
router.post("/", createChannelController);
router.get("/", listChannelsController);
router.post("/:channelId/members", addMemberController);
router.delete("/:channelId/members/:userId", removeMemberController);

// Message routes under channels
router.get("/:channelId/messages", getMessagesController);
router.post("/:channelId/messages", sendMessageController);

// Message edit/delete and replies routes
router.patch("/messages/:messageId", editMessageController);
router.delete("/messages/:messageId", deleteMessageController);
router.get("/messages/:messageId/replies", getThreadRepliesController);

export default router;
