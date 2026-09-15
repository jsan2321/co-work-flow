import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Security Headers & CORS Audit", () => {
  const app = createApp();

  describe("Express Helmet Security Headers", () => {
    it("sets X-Content-Type-Options to nosniff to prevent MIME type sniffing", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("sets X-Frame-Options or CSP frame-ancestors to prevent clickjacking", async () => {
      const res = await request(app).get("/health");
      const frameOptions = res.headers["x-frame-options"];
      const csp = res.headers["content-security-policy"];
      const hasClickjackingProtection =
        frameOptions === "SAMEORIGIN" || (csp && csp.includes("frame-ancestors"));
      expect(hasClickjackingProtection).toBeTruthy();
    });

    it("sets Strict-Transport-Security (HSTS) or Strict transport policies", async () => {
      const res = await request(app).get("/health");
      // Helmet sets strict-transport-security by default (or when configured)
      const hsts = res.headers["strict-transport-security"];
      expect(hsts).toBeDefined();
      expect(hsts).toContain("max-age=");
    });

    it("sets Content-Security-Policy (CSP) headers", async () => {
      const res = await request(app).get("/health");
      const csp = res.headers["content-security-policy"];
      expect(csp).toBeDefined();
      expect(typeof csp).toBe("string");
      expect(csp.length).toBeGreaterThan(0);
    });

    it("sets Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["cross-origin-opener-policy"]).toBe("same-origin");
      expect(res.headers["cross-origin-resource-policy"]).toBe("same-origin");
    });
  });

  describe("CORS Allowlist & Origin Isolation", () => {
    it("reflects allowed frontend origin with credentials permitted", async () => {
      const res = await request(app).get("/health").set("Origin", "http://localhost:3000");

      expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
      expect(res.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("rejects or omits allow-origin header for untrusted third-party origins", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://malicious-phishing-site.example.com");

      // When origin is not in allowlist, cors middleware does not set Access-Control-Allow-Origin
      expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("handles preflight OPTIONS requests with allowed methods and headers", async () => {
      const res = await request(app)
        .options("/api/v1/reservations")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type, Authorization, X-Request-Id");

      expect(res.status).toBe(204);
      expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
      expect(res.headers["access-control-allow-methods"]).toContain("POST");
      expect(res.headers["access-control-allow-headers"]).toContain("Content-Type");
    });
  });
});
