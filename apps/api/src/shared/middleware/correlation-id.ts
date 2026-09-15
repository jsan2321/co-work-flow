import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerId = req.header("X-Request-Id");
  const isValidUuid = headerId ? UUID_REGEX.test(headerId.trim()) : false;
  const correlationId = isValidUuid ? headerId!.trim() : randomUUID();

  req.correlationId = correlationId;
  res.setHeader("X-Request-Id", correlationId);

  next();
}
