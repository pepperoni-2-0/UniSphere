import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  listAuditLogsController,
} from "../controllers/audit.controller.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", listAuditLogsController);

export default router;
