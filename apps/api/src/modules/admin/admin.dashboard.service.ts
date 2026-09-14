import { prisma } from "../../prisma/client.js";
import type { AdminDashboardMetrics } from "@coworkflow/types";
import { auditService, AuditService } from "../audit/audit.service.js";

export class AdminDashboardService {
  constructor(private readonly audit: AuditService = auditService) {}

  async getMetrics(): Promise<AdminDashboardMetrics> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setUTCHours(23, 59, 59, 999);

    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [spacesAggregate, todayReservations, upcoming24hCount, recentLogsResult] =
      await Promise.all([
        prisma.space.aggregate({
          where: { status: "ACTIVE" },
          _count: { id: true },
          _sum: { capacity: true },
        }),
        prisma.reservation.findMany({
          where: {
            status: "CONFIRMED",
            startAt: { gte: startOfToday, lte: endOfToday },
          },
          select: {
            startAt: true,
            endAt: true,
          },
        }),
        prisma.reservation.count({
          where: {
            status: "CONFIRMED",
            startAt: { gte: now, lte: in24h },
          },
        }),
        this.audit.listAuditLogs({ page: 1, pageSize: 10 }),
      ]);

    const totalActiveSpaces = spacesAggregate._count.id ?? 0;
    const totalCapacity = spacesAggregate._sum.capacity ?? 0;
    const todayReservationsCount = todayReservations.length;

    // Calculate utilization based on total operational hours (12 hours/day per active space)
    const bookedMs = todayReservations.reduce((acc, r) => {
      const start = Math.max(r.startAt.getTime(), startOfToday.getTime());
      const end = Math.min(r.endAt.getTime(), endOfToday.getTime());
      return acc + Math.max(0, end - start);
    }, 0);

    const bookedHours = bookedMs / (1000 * 60 * 60);
    const totalAvailableHours = totalActiveSpaces * 12;
    const todayUtilizationPercentage =
      totalAvailableHours > 0
        ? Math.min(100, Math.round((bookedHours / totalAvailableHours) * 100 * 10) / 10)
        : 0;

    return {
      totalActiveSpaces,
      totalCapacity,
      todayReservationsCount,
      upcoming24hReservationsCount: upcoming24Count(upcoming24hCount),
      todayUtilizationPercentage,
      recentAuditLogs: recentLogsResult.data,
    };
  }
}

function upcoming24Count(val: number): number {
  return val;
}

export const adminDashboardService = new AdminDashboardService();
