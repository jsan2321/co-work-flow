import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedAdminUser, seedTestUsersAndSpace } from "../helpers/seed.js";

describe("Admin Dashboard Integration Tests", () => {
  const app = createApp();
  let adminToken: string;
  let memberToken: string;
  let spaceId: string;

  beforeAll(async () => {
    const admin = await seedAdminUser();
    adminToken = admin.adminToken;

    const seed = await seedTestUsersAndSpace();
    memberToken = seed.tokenA;
    spaceId = seed.spaceId;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { spaceId } });
    await prisma.space.deleteMany({ where: { id: spaceId } });
    await prisma.$disconnect();
  });

  it("blocks non-admin users with 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/v1/admin/dashboard")
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it("aggregates dashboard KPIs with under 300ms latency", async () => {
    const startTime = performance.now();

    const res = await request(app)
      .get("/api/v1/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    const duration = performance.now() - startTime;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");

    const { data } = res.body;
    expect(typeof data.totalActiveSpaces).toBe("number");
    expect(typeof data.totalCapacity).toBe("number");
    expect(typeof data.todayReservationsCount).toBe("number");
    expect(typeof data.upcoming24hReservationsCount).toBe("number");
    expect(typeof data.todayUtilizationPercentage).toBe("number");
    expect(Array.isArray(data.recentAuditLogs)).toBe(true);

    // Operational requirement: latency under 300ms
    expect(duration).toBeLessThan(300);
  });
});
