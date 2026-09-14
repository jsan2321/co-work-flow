import { Router } from "express";
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js";
import { getAdminDashboardHandler } from "./admin.dashboard.controller.js";
import { listAuditLogsHandler } from "../audit/audit.controller.js";
import {
  createSpaceHandler,
  updateSpaceHandler,
  updateSpaceStatusHandler,
} from "../spaces/spaces.admin.controller.js";
import {
  adminListReservationsHandler,
  adminCancelReservationHandler,
} from "../reservations/reservations.admin.controller.js";
import {
  adminListUsersHandler,
  adminUpdateUserStatusHandler,
} from "../users/users.admin.controller.js";

const adminRouter = Router();

// Guard all administrative endpoints with authentication and ADMIN role check
adminRouter.use(requireAuth, requireRole("ADMIN"));

// Dashboard metrics
adminRouter.get("/dashboard", getAdminDashboardHandler);

// Immutable audit trail
adminRouter.get("/audit-logs", listAuditLogsHandler);

// Administrative space management
adminRouter.post("/spaces", createSpaceHandler);
adminRouter.patch("/spaces/:id", updateSpaceHandler);
adminRouter.patch("/spaces/:id/status", updateSpaceStatusHandler);

// Administrative reservation dispute resolution
adminRouter.get("/reservations", adminListReservationsHandler);
adminRouter.delete("/reservations/:id", adminCancelReservationHandler);

// Administrative user management
adminRouter.get("/users", adminListUsersHandler);
adminRouter.patch("/users/:id/status", adminUpdateUserStatusHandler);

export { adminRouter };
