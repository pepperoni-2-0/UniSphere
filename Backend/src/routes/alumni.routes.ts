import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  transitionToAlumniController,
  getAlumniDirectoryController,
} from "../controllers/alumni.controller.js";

const router = Router();

router.use(authenticateJWT);

router.post("/transition", transitionToAlumniController);
router.get("/directory", getAlumniDirectoryController);

export default router;
