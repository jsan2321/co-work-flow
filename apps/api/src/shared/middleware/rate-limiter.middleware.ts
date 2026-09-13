import { rateLimit } from "express-rate-limit";
import { AppError } from "../errors/app-error.js";

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "Too many requests from this IP. Please try again after 1 minute."
      )
    );
  },
});
