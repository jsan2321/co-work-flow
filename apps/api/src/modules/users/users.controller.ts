import { Request, Response, NextFunction } from "express";
import { updateProfileSchema } from "./users.schema.js";
import { usersService } from "./users.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

export async function getMeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await usersService.getProfile(req.user.sub);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateMeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const input = updateProfileSchema.parse(req.body);
    const updatedUser = await usersService.updateProfile(req.user.sub, input);

    res.status(200).json({ data: updatedUser });
  } catch (error) {
    next(error);
  }
}
