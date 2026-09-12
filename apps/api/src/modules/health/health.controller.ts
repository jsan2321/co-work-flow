import { Request, Response } from "express";
import { prisma } from "../../prisma/client.js";
import type { HealthResponse, ReadyResponse } from "@coworkflow/types";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const response: HealthResponse = {
    status: "ok",
    uptime: Math.round(process.uptime() * 100) / 100,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
}

export async function getReady(_req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const response: ReadyResponse = {
      status: "ready",
      database: "connected",
    };
    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Database connection failed";
    const response: ReadyResponse = {
      status: "unavailable",
      database: "disconnected",
      error: errorMessage,
    };
    res.status(503).json(response);
  }
}
