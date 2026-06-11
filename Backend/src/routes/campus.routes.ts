import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  listCampusesController,
  getCampusDetailsController,
  createCampusController,
} from "../controllers/campus.controller.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", listCampusesController);
router.get("/:id", getCampusDetailsController);
router.post("/", createCampusController);

export default router;
