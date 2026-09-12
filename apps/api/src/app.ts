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
import { healthRouter } from "./modules/health/health.routes.js";

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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

  // Mount operational health endpoints (Root and API versioned)
  app.use("/", healthRouter);
  app.use("/api/v1", healthRouter);

  // 404 & Error Handlers
  app.use(notFoundHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
