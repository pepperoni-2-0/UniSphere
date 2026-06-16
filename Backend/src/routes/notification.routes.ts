import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  createNotificationController,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", getNotificationsController);
router.post("/", createNotificationController);
router.patch("/read-all", markAllNotificationsAsReadController);
router.patch("/:id/read", markNotificationAsReadController);

export default router;
