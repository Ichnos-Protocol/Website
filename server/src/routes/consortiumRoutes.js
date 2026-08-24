/**
 * Consortium Routes
 *
 * Maps HTTP endpoints to consortium controller handlers.
 * Every route is authenticated: pricing is never public.
 */
import { Router } from "express";
import auth from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { selectTierSchema } from "../validators/consortiumSchemas.js";
import * as consortiumController from "../controllers/consortiumController.js";

const router = Router();

router.get("/me", auth, consortiumController.getMe);

router.get("/tiers", auth, consortiumController.getTiers);

router.put(
  "/tier",
  auth,
  validateRequest(selectTierSchema),
  consortiumController.selectTier,
);

export default router;
