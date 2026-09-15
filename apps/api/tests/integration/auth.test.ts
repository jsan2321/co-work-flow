import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";

describe("Auth Integration Tests", () => {
  const app = createApp();

  const testUser = {
    email: `test_auth_${Date.now()}@example.com`,
    password: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
  };

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  it("registers a new user successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.role).toBe("MEMBER");
    expect(res.body.data.status).toBe("ACTIVE");
  });

  it("rejects duplicate registration with 409 Conflict", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("fails login with incorrect password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("logs in successfully and returns JWT + HttpOnly refresh cookie", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const refreshCookie = Array.isArray(cookies)
      ? cookies.find((c) => c.startsWith("refresh_token="))
      : cookies;
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain("HttpOnly");
  });

  it("rotates refresh token and detects token theft reuse", async () => {
    // 1. Initial Login to get fresh cookie
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const cookies = loginRes.headers["set-cookie"];
    const cookie1 = Array.isArray(cookies)
      ? cookies.find((c) => c.startsWith("refresh_token="))
      : cookies;

    // 2. Refresh successfully (Rotation: Cookie 1 -> Cookie 2)
    const refreshRes = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookie1);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    const cookies2 = refreshRes.headers["set-cookie"];
    const cookie2 = Array.isArray(cookies2)
      ? cookies2.find((c) => c.startsWith("refresh_token="))
      : cookies2;
    expect(cookie2).toBeDefined();
    expect(cookie2).not.toEqual(cookie1);

    // 3. Theft detection: Attacker re-uses old Cookie 1
    const theftRes = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookie1);

    expect(theftRes.status).toBe(401);
    expect(theftRes.body.error.code).toBe("SECURITY_BREACH");

    // 4. Legitimate user tries to use Cookie 2: should now fail because entire family was revoked!
    const subsequentRes = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookie2);

    expect(subsequentRes.status).toBe(401);
  });

  it("logs out user and clears cookie", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const cookies = loginRes.headers["set-cookie"];
    const cookie = Array.isArray(cookies)
      ? cookies.find((c) => c.startsWith("refresh_token="))
      : cookies;

    const logoutRes = await request(app).post("/api/v1/auth/logout").set("Cookie", cookie);

    expect(logoutRes.status).toBe(204);

    // Refresh after logout fails
    const refreshRes = await request(app).post("/api/v1/auth/refresh").set("Cookie", cookie);

    expect(refreshRes.status).toBe(401);
  });
});
