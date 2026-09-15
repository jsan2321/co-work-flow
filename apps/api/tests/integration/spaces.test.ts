import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedTestUsersAndSpace } from "../helpers/seed.js";

describe("Spaces Integration Tests", () => {
  const app = createApp();
  let spaceId: string;
  let memberToken: string;

  beforeAll(async () => {
    const seed = await seedTestUsersAndSpace();
    spaceId = seed.spaceId;
    memberToken = seed.tokenA;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists all spaces with pagination metadata", async () => {
    const res = await request(app).get("/api/v1/spaces");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.data[0].location).toBeDefined();
  });

  it("filters spaces by type", async () => {
    const res = await request(app).get("/api/v1/spaces").query({ type: "DESK" });

    expect(res.status).toBe(200);
    expect(res.body.data.every((s: { type: string }) => s.type === "DESK")).toBe(true);
  });

  it("filters spaces by minCapacity", async () => {
    const res = await request(app).get("/api/v1/spaces").query({ minCapacity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.every((s: { capacity: number }) => s.capacity >= 5)).toBe(true);
  });

  it("retrieves a space by valid ID", async () => {
    const res = await request(app).get(`/api/v1/spaces/${spaceId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(spaceId);
    expect(res.body.data.location).toBeDefined();
  });

  it("returns 404 for non-existent space ID", async () => {
    const res = await request(app).get("/api/v1/spaces/00000000-0000-0000-9999-999999999999");

    expect(res.status).toBe(404);
  });

  it("retrieves availability intervals for a space (requires auth)", async () => {
    // Unauthenticated request should fail
    const unauthRes = await request(app).get(`/api/v1/spaces/${spaceId}/availability`).query({
      startDate: "2026-10-15T00:00:00.000Z",
      endDate: "2026-10-16T00:00:00.000Z",
    });

    expect(unauthRes.status).toBe(401);

    // Authenticated request
    const res = await request(app)
      .get(`/api/v1/spaces/${spaceId}/availability`)
      .set("Authorization", `Bearer ${memberToken}`)
      .query({
        startDate: "2026-10-15T00:00:00.000Z",
        endDate: "2026-10-16T00:00:00.000Z",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.spaceId).toBe(spaceId);
    expect(Array.isArray(res.body.data.intervals)).toBe(true);
  });
});
