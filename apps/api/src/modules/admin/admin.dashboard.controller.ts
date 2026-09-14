import { Request, Response, NextFunction } from "express";
import { adminDashboardService } from "./admin.dashboard.service.js";

export async function getAdminDashboardHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const metrics = await adminDashboardService.getMetrics();
    res.status(200).json({ data: metrics });
  } catch (error) {
    next(error);
  }
}
