import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  sendConnectionRequestController,
  acceptConnectionRequestController,
  blockUserController,
  getConnectionsController,
} from "../controllers/connection.controller.js";

const router = Router();

router.use(authenticateJWT);

router.post("/request", sendConnectionRequestController);
router.post("/accept", acceptConnectionRequestController);
router.post("/block", blockUserController);
router.get("/", getConnectionsController);

export default router;
