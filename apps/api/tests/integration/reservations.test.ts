import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedTestUsersAndSpace } from "../helpers/seed.js";
import { generateAccessToken } from "../../src/shared/utils/jwt.js";

describe("Reservations Integration Tests", () => {
  const app = createApp();
  let spaceId: string;
  let userAId: string;
  let _userBId: string;
  let tokenA: string;
  let tokenB: string;
  let adminToken: string;

  beforeAll(async () => {
    const seed = await seedTestUsersAndSpace();
    spaceId = seed.spaceId;
    userAId = seed.userA.id;
    _userBId = seed.userB.id;
    tokenA = seed.tokenA;
    tokenB = seed.tokenB;

    const admin = await prisma.user.upsert({
      where: { email: "admin_test@coworkflow.com" },
      update: {},
      create: {
        email: "admin_test@coworkflow.com",
        passwordHash: "hash",
        firstName: "Admin",
        lastName: "Tester",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    adminToken = generateAccessToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });
  });

  afterAll(async () => {
    if (spaceId) {
      await prisma.reservation.deleteMany({
        where: { spaceId },
      });
      await prisma.space.delete({
        where: { id: spaceId },
      });
    }
    await prisma.$disconnect();
  });

  describe("POST /api/v1/reservations (Creation & Validation)", () => {
    it("creates a reservation successfully for a valid future window", async () => {
      const startAt = new Date(Date.now() + 10 * 86400000); // 10 days in future
      const endAt = new Date(startAt.getTime() + 2 * 3600000); // 2 hours duration

      const res = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          purpose: "Design sprint planning",
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe("CONFIRMED");
      expect(res.body.data.spaceId).toBe(spaceId);
      expect(res.body.data.userId).toBe(userAId);
      expect(res.body.data.space).toBeDefined();
    });

    it("rejects reservations with startAt in the past", async () => {
      const pastStart = new Date(Date.now() - 3600000); // 1 hour ago
      const pastEnd = new Date(Date.now() + 3600000);

      const res = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: pastStart.toISOString(),
          endAt: pastEnd.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects reservations shorter than 30 minutes", async () => {
      const startAt = new Date(Date.now() + 86400000);
      const endAt = new Date(startAt.getTime() + 15 * 60000); // 15 mins

      const res = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects reservations longer than 8 hours", async () => {
      const startAt = new Date(Date.now() + 86400000);
      const endAt = new Date(startAt.getTime() + 9 * 3600000); // 9 hours

      const res = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects reservations where endAt is before startAt", async () => {
      const startAt = new Date(Date.now() + 86400000);
      const endAt = new Date(startAt.getTime() - 3600000);

      const res = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/reservations/:id (Privacy & Ownership)", () => {
    it("allows owner to view their reservation", async () => {
      const startAt = new Date(Date.now() + 12 * 86400000);
      const endAt = new Date(startAt.getTime() + 3600000);

      const createRes = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      const reservationId = createRes.body.data.id;

      const getRes = await request(app)
        .get(`/api/v1/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(reservationId);
    });

    it("returns 404 NOT FOUND when another member attempts to view it (privacy disguise)", async () => {
      const startAt = new Date(Date.now() + 13 * 86400000);
      const endAt = new Date(startAt.getTime() + 3600000);

      const createRes = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      const reservationId = createRes.body.data.id;

      // Member B attempts to view Member A's reservation
      const getRes = await request(app)
        .get(`/api/v1/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      // Crucial: Must be 404, NOT 403, to prevent enumeration of reservation IDs
      expect(getRes.status).toBe(404);
      expect(getRes.body.error.code).toBe("NOT_FOUND");
    });

    it("allows admin to view any member's reservation", async () => {
      const startAt = new Date(Date.now() + 14 * 86400000);
      const endAt = new Date(startAt.getTime() + 3600000);

      const createRes = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      const reservationId = createRes.body.data.id;

      const getRes = await request(app)
        .get(`/api/v1/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(reservationId);
    });
  });

  describe("DELETE /api/v1/reservations/:id (Cancellation & Cutoff)", () => {
    it("allows member to cancel reservation > 1 hour before start", async () => {
      const startAt = new Date(Date.now() + 15 * 86400000); // 15 days out
      const endAt = new Date(startAt.getTime() + 3600000);

      const createRes = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          spaceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        });

      const reservationId = createRes.body.data.id;

      const cancelRes = await request(app)
        .delete(`/api/v1/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe("CANCELLED");
      expect(cancelRes.body.data.cancelledAt).toBeDefined();

      // Verify idempotent cancellation
      const secondCancelRes = await request(app)
        .delete(`/api/v1/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(secondCancelRes.status).toBe(200);
      expect(secondCancelRes.body.data.status).toBe("CANCELLED");
    });

    it("prevents member from cancelling when within the 1-hour cutoff window", async () => {
      // Directly insert a reservation starting in 30 minutes (bypassing the POST endpoint for testing cutoff)
      const nearFutureStart = new Date(Date.now() + 30 * 60000); // 30 minutes from now
      const nearFutureEnd = new Date(nearFutureStart.getTime() + 60 * 60000);

      const reservation = await prisma.reservation.create({
        data: {
          userId: userAId,
          spaceId,
          startAt: nearFutureStart,
          endAt: nearFutureEnd,
          status: "CONFIRMED",
        },
      });

      const cancelRes = await request(app)
        .delete(`/api/v1/reservations/${reservation.id}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(cancelRes.status).toBe(403);
      expect(cancelRes.body.error.code).toBe("CANCELLATION_WINDOW_CLOSED");
    });
  });
});
