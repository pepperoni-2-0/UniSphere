import { Router } from "express";
import {
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
  googleAuthInitiateController,
  googleAuthCallbackController,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema, oauthCallbackSchema } from "../lib/zod.schemas.js";

const router = Router();

// Standard Credentials Auth (validated)
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  registerController
);

router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  loginController
);

router.post("/logout", logoutController);
router.post("/refresh", refreshTokenController);

// OAuth Initiation and Callback
router.get("/oauth/google", googleAuthInitiateController);

router.get(
  "/oauth/google/callback",
  validateRequest({ query: oauthCallbackSchema }),
  googleAuthCallbackController
);

export default router;
