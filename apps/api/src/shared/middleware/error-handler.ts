import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { logger } from "../logger/logger.js";
import type { ApiErrorResponse } from "@coworkflow/types";

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.correlationId || "unknown";

  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        requestId,
        url: req.originalUrl,
        method: req.method,
      },
      `AppError [${err.code}]: ${err.message}`
    );

    const body: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
        ...(err.details && { details: err.details }),
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    logger.warn(
      {
        issues: err.issues,
        requestId,
        url: req.originalUrl,
        method: req.method,
      },
      "Zod validation failed"
    );

    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      issue: issue.message,
    }));

    const body: ApiErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        requestId,
        details,
      },
    };

    res.status(400).json(body);
    return;
  }

  logger.error(
    {
      err,
      requestId,
      url: req.originalUrl,
      method: req.method,
    },
    `Unhandled error: ${err.message}`
  );

  const body: ApiErrorResponse = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected internal server error occurred"
          : err.message,
      requestId,
    },
  };

  res.status(500).json(body);
}

export function notFoundHandlerMiddleware(req: Request, res: Response): void {
  const requestId = req.correlationId || "unknown";
  const body: ApiErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      requestId,
    },
  };

  res.status(404).json(body);
}
