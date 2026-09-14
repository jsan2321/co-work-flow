import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedAdminUser, seedTestUsersAndSpace } from "../helpers/seed.js";

describe("Admin Reservations Integration Tests", () => {
  const app = createApp();
  let adminToken: string;
  let adminUserId: string;
  let memberToken: string;
  let memberUserId: string;
  let spaceId: string;
  let reservationId: string;

  beforeAll(async () => {
    const admin = await seedAdminUser();
    adminToken = admin.adminToken;
    adminUserId = admin.adminUser.id;

    const seed = await seedTestUsersAndSpace();
    memberToken = seed.tokenA;
    memberUserId = seed.userA.id;
    spaceId = seed.spaceId;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { spaceId } });
    await prisma.space.deleteMany({ where: { id: spaceId } });
    await prisma.$disconnect();
  });

  describe("GET /api/v1/admin/reservations", () => {
    it("blocks non-admin users with 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reservations")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it("allows admin to view all reservations with pagination metadata", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reservations")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("meta");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("DELETE /api/v1/admin/reservations/:id (Dispute Resolution & Cutoff Override)", () => {
    it("rejects cancellation if mandatory reason is missing or too short", async () => {
      // Create a test reservation directly
      const startAt = new Date(Date.now() + 24 * 3600000);
      const endAt = new Date(startAt.getTime() + 2 * 3600000);
      const resv = await prisma.reservation.create({
        data: {
          userId: memberUserId,
          spaceId,
          startAt,
          endAt,
          status: "CONFIRMED",
        },
      });

      const res = await request(app)
        .delete(`/api/v1/admin/reservations/${resv.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "bad" }); // less than 5 characters

      expect(res.status).toBe(400);

      // Clean up
      await prisma.reservation.delete({ where: { id: resv.id } });
    });

    it("overrides the 1-hour cutoff window and records RESERVATION_CANCELLED_BY_ADMIN audit log", async () => {
      // Create a reservation starting in 20 minutes (within the 1-hour cutoff window)
      const startAt = new Date(Date.now() + 20 * 60 * 1000);
      const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

      const nearReservation = await prisma.reservation.create({
        data: {
          userId: memberUserId,
          spaceId,
          startAt,
          endAt,
          status: "CONFIRMED",
          purpose: "Urgent client demo",
        },
      });
      reservationId = nearReservation.id;

      // Verify regular member cancellation is blocked by cutoff window
      const memberAttempt = await request(app)
        .delete(`/api/v1/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(memberAttempt.status).toBe(403);
      expect(memberAttempt.body.error.code).toBe("CANCELLATION_WINDOW_CLOSED");

      // Admin executes override cancellation with mandatory dispute reason
      const adminReason = "Space maintenance: emergency electrical repair required immediately";
      const adminRes = await request(app)
        .delete(`/api/v1/admin/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: adminReason });

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.status).toBe("CANCELLED");
      expect(adminRes.body.data.cancellationReason).toBe(adminReason);
      expect(adminRes.body.data.cancelledByUserId).toBe(adminUserId);

      // Verify database record
      const dbRecord = await prisma.reservation.findUnique({
        where: { id: reservationId },
      });
      expect(dbRecord?.status).toBe("CANCELLED");
      expect(dbRecord?.cancellationReason).toBe(adminReason);

      // Verify audit trail entry was recorded
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          entityId: reservationId,
          action: "RESERVATION_CANCELLED_BY_ADMIN",
        },
      });
      expect(auditLog).not.toBeNull();
      expect(auditLog?.actorUserId).toBe(adminUserId);

      // Verify idempotency: repeated administrative cancellation succeeds gracefully
      const repeatRes = await request(app)
        .delete(`/api/v1/admin/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: adminReason });

      expect(repeatRes.status).toBe(200);
      expect(repeatRes.body.data.status).toBe("CANCELLED");
    });
  });
});
