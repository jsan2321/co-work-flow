import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./shared/logger/logger.js";
import { correlationIdMiddleware } from "./shared/middleware/correlation-id.js";
import {
  errorHandlerMiddleware,
  notFoundHandlerMiddleware,
} from "./shared/middleware/error-handler.js";
import helmet from "helmet";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { spacesRouter } from "./modules/spaces/spaces.routes.js";
import { reservationsRouter } from "./modules/reservations/reservations.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(helmet());
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Correlation ID tracking
  app.use(correlationIdMiddleware);

  // Structured HTTP request logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.correlationId,
      autoLogging: {
        ignore: (req) => req.url === "/health" || req.url === "/ready",
      },
    })
  );

  // Operational health endpoints
  app.use("/", healthRouter);
  app.use("/api/v1", healthRouter);

  // Domain routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/spaces", spacesRouter);
  app.use("/api/v1/reservations", reservationsRouter);
  app.use("/api/v1/admin", adminRouter);

  // 404 & Error Handlers
  app.use(notFoundHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
