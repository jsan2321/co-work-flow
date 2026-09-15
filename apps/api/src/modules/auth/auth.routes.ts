import { Router } from "express";
import { registerHandler, loginHandler, refreshHandler, logoutHandler } from "./auth.controller.js";
import { authRateLimiter } from "../../shared/middleware/rate-limiter.middleware.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerHandler);
authRouter.post("/login", authRateLimiter, loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", logoutHandler);
