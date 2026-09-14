import { Request, Response, NextFunction } from "express";
import { auditLogFilterSchema } from "./audit.schema.js";
import { auditService } from "./audit.service.js";

export async function listAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = auditLogFilterSchema.parse(req.query);
    const result = await auditService.listAuditLogs(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
