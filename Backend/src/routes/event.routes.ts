import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  createEventController,
  getEventsController,
  rsvpEventController
} from "../controllers/event.controller.js";

const router = Router();

// Secure all event routes
router.use(authenticateJWT);

router.post("/", createEventController);
router.get("/", getEventsController);
router.post("/:id/rsvp", rsvpEventController);

export default router;
