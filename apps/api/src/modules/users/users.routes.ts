import { Router } from "express";
import { getMeHandler, updateMeHandler } from "./users.controller.js";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, getMeHandler);
usersRouter.patch("/me", requireAuth, updateMeHandler);
