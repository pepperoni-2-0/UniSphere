import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  reportContentController,
  getReportsController,
  warnUserController,
  removeContentController,
  banUserController,
} from "../controllers/moderation.controller.js";

const router = Router();

router.use(authenticateJWT);

router.post("/report", reportContentController);
router.get("/reports", getReportsController);
router.post("/warn", warnUserController);
router.post("/remove", removeContentController);
router.post("/ban", banUserController);

export default router;
