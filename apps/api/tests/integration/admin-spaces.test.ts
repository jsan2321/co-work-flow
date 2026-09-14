import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedAdminUser, seedTestUsersAndSpace } from "../helpers/seed.js";

describe("Admin Spaces Integration Tests", () => {
  const app = createApp();
  let adminToken: string;
  let adminUserId: string;
  let memberToken: string;
  let locationId: string;
  let createdSpaceId: string;

  beforeAll(async () => {
    const admin = await seedAdminUser();
    adminToken = admin.adminToken;
    adminUserId = admin.adminUser.id;

    const seed = await seedTestUsersAndSpace();
    memberToken = seed.tokenA;

    const location = await prisma.location.findFirst({
      where: { status: "ACTIVE" },
    });
    locationId = location!.id;
  });

  afterAll(async () => {
    if (createdSpaceId) {
      await prisma.reservation.deleteMany({ where: { spaceId: createdSpaceId } });
      await prisma.space.deleteMany({ where: { id: createdSpaceId } });
    }
    await prisma.$disconnect();
  });

  describe("POST /api/v1/admin/spaces", () => {
    it("rejects non-admin requests with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/v1/admin/spaces")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          locationId,
          name: "Unauthorized Space",
          type: "MEETING_ROOM",
          capacity: 8,
        });

      expect(res.status).toBe(403);
    });

    it("allows admin to create a new space and emits SPACE_CREATED audit log", async () => {
      const spaceName = `Admin Conference Room ${Date.now()}`;
      const res = await request(app)
        .post("/api/v1/admin/spaces")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          locationId,
          name: spaceName,
          type: "MEETING_ROOM",
          capacity: 10,
          description: "High-spec conference room with video conferencing equipment",
          amenities: ["4K Display", "Video Conferencing", "Whiteboard"],
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe(spaceName);
      expect(res.body.data.status).toBe("ACTIVE");
      createdSpaceId = res.body.data.id;

      // Verify audit log was recorded
      const auditRecord = await prisma.auditLog.findFirst({
        where: {
          entityId: createdSpaceId,
          action: "SPACE_CREATED",
        },
      });
      expect(auditRecord).not.toBeNull();
      expect(auditRecord?.actorUserId).toBe(adminUserId);
    });
  });

  describe("PATCH /api/v1/admin/spaces/:id", () => {
    it("allows admin to update space details and emits SPACE_UPDATED audit log", async () => {
      const updatedName = `Renovated Room ${Date.now()}`;
      const res = await request(app)
        .patch(`/api/v1/admin/spaces/${createdSpaceId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: updatedName,
          capacity: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(updatedName);
      expect(res.body.data.capacity).toBe(12);

      const auditRecord = await prisma.auditLog.findFirst({
        where: {
          entityId: createdSpaceId,
          action: "SPACE_UPDATED",
        },
      });
      expect(auditRecord).not.toBeNull();
    });
  });

  describe("PATCH /api/v1/admin/spaces/:id/status", () => {
    it("deactivates space, emits audit log, and blocks new member bookings", async () => {
      // 1. Deactivate space
      const statusRes = await request(app)
        .patch(`/api/v1/admin/spaces/${createdSpaceId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INACTIVE" });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe("INACTIVE");

      // Verify audit log
      const auditRecord = await prisma.auditLog.findFirst({
        where: {
          entityId: createdSpaceId,
          action: "SPACE_STATUS_CHANGED",
        },
      });
      expect(auditRecord).not.toBeNull();

      // 2. Verify member booking fails because space is inactive
      const futureStart = new Date(Date.now() + 5 * 86400000);
      const futureEnd = new Date(futureStart.getTime() + 2 * 3600000);

      const bookRes = await request(app)
        .post("/api/v1/reservations")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          spaceId: createdSpaceId,
          startAt: futureStart.toISOString(),
          endAt: futureEnd.toISOString(),
          purpose: "Attempting to book inactive space",
        });

      expect(bookRes.status).toBe(404);

      // 3. Reactivate space
      const reactivateRes = await request(app)
        .patch(`/api/v1/admin/spaces/${createdSpaceId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "ACTIVE" });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.status).toBe("ACTIVE");
    });
  });
});
