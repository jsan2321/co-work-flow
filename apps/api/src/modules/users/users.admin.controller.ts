import { Request, Response, NextFunction } from "express";
import {
  adminUserFilterSchema,
  updateUserStatusSchema,
} from "./users.schema.js";
import { usersService } from "./users.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

export async function adminListUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = adminUserFilterSchema.parse(req.query);
    const result = await usersService.adminListUsers(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateUserStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.params.id as string;
    const { status } = updateUserStatusSchema.parse(req.body);
    const user = await usersService.updateUserStatus(
      req.user.sub,
      req.correlationId,
      userId,
      status
    );

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}
