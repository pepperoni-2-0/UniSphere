import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  listRolesController,
  createRoleController,
  assignRoleController,
} from "../controllers/role.controller.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", listRolesController);
router.post("/", createRoleController);
router.post("/assign", assignRoleController);

export default router;
