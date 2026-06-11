import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  getUserProfileController,
  getUserProfileByIdController,
  updateCustomStatusController,
  updateBioController,
  updateAvatarController,
  searchDirectoryController,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authenticateJWT);

router.get("/profile", getUserProfileController);
router.get("/search", searchDirectoryController);
router.get("/:id", getUserProfileByIdController);
router.patch("/status", updateCustomStatusController);
router.patch("/bio", updateBioController);
router.patch("/avatar", updateAvatarController);

export default router;
