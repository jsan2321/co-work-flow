import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";

describe("Live DB Integration Test — Health Probes (FR-HEALTH-001)", () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 200 OK with database: connected against real PostgreSQL 18", async () => {
    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ready",
      database: "connected",
    });
  });

  it("verifies basic schema tables exist in the database", async () => {
    // Query PostgreSQL information_schema to verify domain schema tables exist in the database
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tableNames = tables.map((t) => t.table_name);
    expect(tableNames).toContain("user");
    expect(tableNames).toContain("location");
    expect(tableNames).toContain("space");
    expect(tableNames).toContain("reservation");
    expect(tableNames).toContain("refresh_token");
    expect(tableNames).toContain("audit_log");
  });
});
