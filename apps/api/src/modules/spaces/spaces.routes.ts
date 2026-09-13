import { Router } from "express";
import {
  listSpacesHandler,
  getSpaceHandler,
  getAvailabilityHandler,
} from "./spaces.controller.js";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";

export const spacesRouter = Router();

spacesRouter.get("/", listSpacesHandler);
spacesRouter.get("/:id", getSpaceHandler);
spacesRouter.get("/:id/availability", requireAuth, getAvailabilityHandler);
