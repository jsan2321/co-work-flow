import { Request, Response, NextFunction } from "express";
import {
  createSpaceSchema,
  updateSpaceSchema,
  updateSpaceStatusSchema,
} from "./spaces.schema.js";
import { spacesService } from "./spaces.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

export async function createSpaceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const input = createSpaceSchema.parse(req.body);
    const space = await spacesService.createSpace(
      req.user.sub,
      req.correlationId,
      input
    );

    res.status(201).json({ data: space });
  } catch (error) {
    next(error);
  }
}

export async function updateSpaceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const spaceId = req.params.id as string;
    const input = updateSpaceSchema.parse(req.body);
    const space = await spacesService.updateSpace(
      req.user.sub,
      req.correlationId,
      spaceId,
      input
    );

    res.status(200).json({ data: space });
  } catch (error) {
    next(error);
  }
}

export async function updateSpaceStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const spaceId = req.params.id as string;
    const { status } = updateSpaceStatusSchema.parse(req.body);
    const space = await spacesService.updateSpaceStatus(
      req.user.sub,
      req.correlationId,
      spaceId,
      status
    );

    res.status(200).json({ data: space });
  } catch (error) {
    next(error);
  }
}
