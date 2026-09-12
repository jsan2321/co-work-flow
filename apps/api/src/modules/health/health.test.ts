import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../prisma/client.js";

describe("Health & Readiness Probes (FR-HEALTH-001)", () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /health (Liveness)", () => {
    it("returns 200 OK with status ok and uptime", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("uptime");
      expect(typeof res.body.uptime).toBe("number");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.headers).toHaveProperty("x-request-id");
    });

    it("returns 200 OK when requested via /api/v1/health", async () => {
      const res = await request(app).get("/api/v1/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("GET /ready (Readiness)", () => {
    it("returns 200 OK when database responds to ping", async () => {
      vi.spyOn(prisma, "$queryRaw").mockResolvedValueOnce([{ "?column?": 1 }]);

      const res = await request(app).get("/ready");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "ready",
        database: "connected",
      });
    });

    it("returns 503 Service Unavailable when database fails ping", async () => {
      vi.spyOn(prisma, "$queryRaw").mockRejectedValueOnce(new Error("Connection refused"));

      const res = await request(app).get("/ready");

      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({
        status: "unavailable",
        database: "disconnected",
        error: "Connection refused",
      });
    });
  });

  describe("Error Envelope & 404 Handling", () => {
    it("returns 404 with standard error envelope for nonexistent route", async () => {
      const res = await request(app).get("/api/v1/unknown-route");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
      expect(res.body.error).toHaveProperty("message");
      expect(res.body.error).toHaveProperty("requestId");
    });
  });
});
