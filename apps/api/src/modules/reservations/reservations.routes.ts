import { Router } from "express";
import {
  createReservationHandler,
  getReservationHandler,
  listMemberReservationsHandler,
  cancelReservationHandler,
} from "./reservations.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js";

export const reservationsRouter = Router();

reservationsRouter.post("/", requireAuth, requireRole("MEMBER", "ADMIN"), createReservationHandler);

reservationsRouter.get("/", requireAuth, listMemberReservationsHandler);

reservationsRouter.get("/:id", requireAuth, getReservationHandler);

reservationsRouter.delete("/:id", requireAuth, cancelReservationHandler);
