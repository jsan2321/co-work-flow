import { Request, Response, NextFunction } from "express";
import {
  adminReservationFilterSchema,
  adminCancelReservationSchema,
} from "./reservations.schema.js";
import { reservationsService } from "./reservations.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

export async function adminListReservationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = adminReservationFilterSchema.parse(req.query);
    const result = await reservationsService.adminListReservations(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function adminCancelReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const reservationId = req.params.id as string;
    const { reason } = adminCancelReservationSchema.parse(req.body);
    const reservation = await reservationsService.adminCancelReservation(
      req.user.sub,
      req.correlationId,
      reservationId,
      reason
    );

    res.status(200).json({ data: reservation });
  } catch (error) {
    next(error);
  }
}
