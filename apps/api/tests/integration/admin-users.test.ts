import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedAdminUser, seedTestUsersAndSpace } from "../helpers/seed.js";
import { hashToken } from "../../src/shared/utils/crypto.js";

describe("Admin Users Integration Tests", () => {
  const app = createApp();
  let adminToken: string;
  let adminUserId: string;
  let memberToken: string;
  let memberUser: { id: string; email: string };
  const memberPassword = "MemberPassword123!";

  beforeAll(async () => {
    const admin = await seedAdminUser();
    adminToken = admin.adminToken;
    adminUserId = admin.adminUser.id;

    const seed = await seedTestUsersAndSpace();
    memberToken = seed.tokenA;
    memberUser = seed.userA;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/v1/admin/users", () => {
    it("rejects non-admin users with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it("allows admin to list users with pagination and search filter", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users?search=${encodeURIComponent(memberUser.email)}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(memberUser.id);
      expect(res.body.data[0].email).toBe(memberUser.email);
    });
  });

  describe("PATCH /api/v1/admin/users/:id/status (Lifecycle & Token Purge)", () => {
    it("strictly prevents administrators from deactivating their own account", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${adminUserId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "DEACTIVATED" });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("CANNOT_DEACTIVATE_SELF");
    });

    it("deactivates member, revokes active refresh tokens, blocks login, and emits audit log", async () => {
      // 1. Create a dummy refresh token for the member to ensure purge verification
      const rawToken = "dummy-refresh-token-for-deactivation-test";
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.create({
        data: {
          userId: memberUser.id,
          tokenHash,
          familyId: "00000000-0000-0000-0000-000000000099",
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: false,
        },
      });

      // 2. Admin deactivates the member
      const deactivateRes = await request(app)
        .patch(`/api/v1/admin/users/${memberUser.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "DEACTIVATED" });

      expect(deactivateRes.status).toBe(200);
      expect(deactivateRes.body.data.status).toBe("DEACTIVATED");

      // 3. Verify user's refresh tokens are purged/revoked in DB
      const activeTokensCount = await prisma.refreshToken.count({
        where: {
          userId: memberUser.id,
          isRevoked: false,
        },
      });
      expect(activeTokensCount).toBe(0);

      // 4. Verify deactivated user cannot log in
      const loginAttempt = await request(app).post("/api/v1/auth/login").send({
        email: memberUser.email,
        password: memberPassword,
      });

      expect(loginAttempt.status).toBe(403);

      // 5. Verify audit log entry
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          entityId: memberUser.id,
          action: "USER_STATUS_CHANGED",
        },
      });
      expect(auditLog).not.toBeNull();
      expect(auditLog?.actorUserId).toBe(adminUserId);

      // 6. Reactivate member
      const reactivateRes = await request(app)
        .patch(`/api/v1/admin/users/${memberUser.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "ACTIVE" });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.status).toBe("ACTIVE");

      // 7. Verify member can log in again
      const loginSuccess = await request(app).post("/api/v1/auth/login").send({
        email: memberUser.email,
        password: memberPassword,
      });

      expect(loginSuccess.status).toBe(200);
    });
  });
});
