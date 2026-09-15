import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedTestUsersAndSpace, seedAdminUser } from "../helpers/seed.js";
import { auditService } from "../../src/modules/audit/audit.service.js";

describe("Audit Logging & Immutability Integration Tests", () => {
  const app = createApp();
  let adminToken: string;
  let adminUser: { id: string; email: string };
  let memberToken: string;
  let _memberUser: { id: string; email: string };
  const createdAuditLogIds: string[] = [];

  beforeAll(async () => {
    const admin = await seedAdminUser();
    adminUser = admin.adminUser;
    adminToken = admin.adminToken;

    const seed = await seedTestUsersAndSpace();
    _memberUser = seed.userA;
    memberToken = seed.tokenA;
  });

  afterAll(async () => {
    // Note: audit_log records cannot be deleted via normal DELETE due to trigger,
    // but test user and space records can be cleaned up
    await prisma.$disconnect();
  });

  describe("Database Trigger Immutability Protection", () => {
    it("strictly blocks raw UPDATE statements on audit_log table", async () => {
      // Create a test audit log directly
      const log = await auditService.emit({
        actorUserId: adminUser.id,
        action: "TEST_IMMUTABILITY_ACTION",
        entityType: "TEST_ENTITY",
        entityId: "00000000-0000-0000-0000-000000000099",
        metadata: { key: "initial_value" },
        correlationId: "00000000-0000-0000-0000-000000000001",
      });
      createdAuditLogIds.push(log.id);

      // Attempt raw UPDATE on the audit log entry
      let updateError: Error | null = null;
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE audit_log SET action = 'TAMPERED_ACTION' WHERE id = $1::uuid`,
          log.id
        );
      } catch (err) {
        updateError = err as Error;
      }

      expect(updateError).not.toBeNull();
      expect(updateError!.message).toMatch(
        /Audit logs are immutable.*UPDATE and DELETE operations are forbidden/i
      );

      // Verify record was NOT modified
      const record = await prisma.auditLog.findUnique({ where: { id: log.id } });
      expect(record?.action).toBe("TEST_IMMUTABILITY_ACTION");
    });

    it("strictly blocks raw DELETE statements on audit_log table", async () => {
      const log = await auditService.emit({
        actorUserId: adminUser.id,
        action: "TEST_DELETE_BLOCK",
        entityType: "TEST_ENTITY",
        entityId: "00000000-0000-0000-0000-000000000099",
        metadata: { key: "do_not_delete" },
        correlationId: "00000000-0000-0000-0000-000000000002",
      });
      createdAuditLogIds.push(log.id);

      let deleteError: Error | null = null;
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM audit_log WHERE id = $1::uuid`, log.id);
      } catch (err) {
        deleteError = err as Error;
      }

      expect(deleteError).not.toBeNull();
      expect(deleteError!.message).toMatch(
        /Audit logs are immutable.*UPDATE and DELETE operations are forbidden/i
      );

      // Verify record still exists
      const record = await prisma.auditLog.findUnique({ where: { id: log.id } });
      expect(record).not.toBeNull();
    });
  });

  describe("GET /api/v1/admin/audit-logs", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).get("/api/v1/admin/audit-logs");
      expect(res.status).toBe(401);
    });

    it("returns 403 when called by a non-admin member", async () => {
      const res = await request(app)
        .get("/api/v1/admin/audit-logs")
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("allows admin to retrieve paginated audit logs", async () => {
      const res = await request(app)
        .get("/api/v1/admin/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("meta");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.page).toBe(1);
    });

    it("filters audit logs by action and entityType", async () => {
      const testAction = `CUSTOM_FILTER_${Date.now()}`;
      await auditService.emit({
        actorUserId: adminUser.id,
        action: testAction,
        entityType: "FILTER_ENTITY",
        entityId: "00000000-0000-0000-0000-000000000088",
        correlationId: "00000000-0000-0000-0000-000000000003",
      });

      const res = await request(app)
        .get(`/api/v1/admin/audit-logs?action=${testAction}&entityType=FILTER_ENTITY`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].action).toBe(testAction);
      expect(res.body.data[0].entityType).toBe("FILTER_ENTITY");
    });
  });
});
