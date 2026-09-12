import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerId = req.header("X-Request-Id");
  const correlationId = headerId && headerId.trim() !== "" ? headerId : randomUUID();

  req.correlationId = correlationId;
  res.setHeader("X-Request-Id", correlationId);

  next();
}
