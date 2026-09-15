import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Rate Limiting Security Verification", () => {
  const app = createApp();

  it("permits up to 10 authentication attempts and throttles the 11th with HTTP 429", async () => {
    const payload = {
      email: "rate_limit_test@example.com",
      password: "WrongPassword123!",
    };

    // First 10 requests should reach loginHandler and return 401 (not rate limited)
    for (let i = 1; i <= 10; i++) {
      const res = await request(app).post("/api/v1/auth/login").send(payload);

      expect(res.status).toBe(401);
      expect(res.headers["ratelimit-limit"]).toBe("10");
      expect(Number(res.headers["ratelimit-remaining"])).toBe(10 - i);
    }

    // 11th request must be intercepted by rate limiter and return HTTP 429
    const throttledRes = await request(app).post("/api/v1/auth/login").send(payload);

    expect(throttledRes.status).toBe(429);
    expect(throttledRes.body.error).toBeDefined();
    expect(throttledRes.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(throttledRes.body.error.message).toContain("Too many requests");
    expect(throttledRes.headers["retry-after"]).toBeDefined();
  });
});
