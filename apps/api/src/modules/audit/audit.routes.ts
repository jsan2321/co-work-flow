import { Router } from "express";
import { listAuditLogsHandler } from "./audit.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js";

export const auditRouter = Router();

auditRouter.get("/", requireAuth, requireRole("ADMIN"), listAuditLogsHandler);
