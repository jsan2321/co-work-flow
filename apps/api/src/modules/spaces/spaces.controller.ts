import { Request, Response, NextFunction } from "express";
import { spaceFilterSchema, availabilityQuerySchema } from "./spaces.schema.js";
import { spacesService } from "./spaces.service.js";

export async function listSpacesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = spaceFilterSchema.parse(req.query);
    const result = await spacesService.listSpaces(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSpaceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const spaceId = req.params.id as string;
    const space = await spacesService.getSpaceById(spaceId);
    res.status(200).json({ data: space });
  } catch (error) {
    next(error);
  }
}

export async function getAvailabilityHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const spaceId = req.params.id as string;
    const { startDate, endDate } = availabilityQuerySchema.parse(req.query);

    const availability = await spacesService.getAvailability(
      spaceId,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({ data: availability });
  } catch (error) {
    next(error);
  }
}
