import { Request, Response, NextFunction } from "express";
import { createReservationSchema, reservationFilterSchema } from "./reservations.schema.js";
import { reservationsService } from "./reservations.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

export async function createReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }
    const input = createReservationSchema.parse(req.body);
    const reservation = await reservationsService.createReservation(req.user.sub, input);
    res.status(201).json({ data: reservation });
  } catch (error) {
    next(error);
  }
}

export async function getReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }
    const reservationId = req.params.id as string;
    const reservation = await reservationsService.getReservationById(
      req.user.sub,
      req.user.role,
      reservationId
    );
    res.status(200).json({ data: reservation });
  } catch (error) {
    next(error);
  }
}

export async function listMemberReservationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }
    const query = reservationFilterSchema.parse(req.query);
    const result = await reservationsService.listMemberReservations(req.user.sub, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function cancelReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }
    const reservationId = req.params.id as string;
    const reservation = await reservationsService.cancelReservation(
      req.user.sub,
      req.user.role,
      reservationId
    );
    res.status(200).json({ data: reservation });
  } catch (error) {
    next(error);
  }
}
