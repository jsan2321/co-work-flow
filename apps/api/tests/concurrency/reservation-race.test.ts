import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/prisma/client.js";
import { seedTestUsersAndSpace } from "../helpers/seed.js";

describe("Concurrency: Double-Booking Prevention with PostgreSQL GiST Exclusion", () => {
  const app = createApp();
  let spaceId: string;
  let memberA_token: string;
  let memberB_token: string;

  beforeAll(async () => {
    const seed = await seedTestUsersAndSpace();
    spaceId = seed.spaceId;
    memberA_token = seed.tokenA;
    memberB_token = seed.tokenB;
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

  it("permits exactly 1 reservation out of simultaneous overlapping requests over 20 iterations", async () => {
    const ITERATIONS = 20;

    for (let i = 0; i < ITERATIONS; i++) {
      // Offset by 1 day per iteration to avoid conflicts across test loops
      const startTime = new Date(Date.now() + (i + 1) * 86400000 + 3600000);
      const endTime = new Date(startTime.getTime() + 2 * 3600000);

      const bookingPayload = {
        spaceId,
        startAt: startTime.toISOString(),
        endAt: endTime.toISOString(),
        purpose: `Concurrency race test iteration ${i + 1}`,
      };

      // Fire simultaneous overlapping requests
      const [responseA, responseB] = await Promise.all([
        request(app)
          .post("/api/v1/reservations")
          .set("Authorization", `Bearer ${memberA_token}`)
          .send(bookingPayload),
        request(app)
          .post("/api/v1/reservations")
          .set("Authorization", `Bearer ${memberB_token}`)
          .send(bookingPayload),
      ]);

      const statusCodes = [responseA.status, responseB.status].sort();
      expect(
        statusCodes,
        `Failed at iteration ${i + 1}: statusA=${responseA.status} bodyA=${JSON.stringify(responseA.body)}, statusB=${responseB.status} bodyB=${JSON.stringify(responseB.body)}`
      ).toEqual([201, 409]);

      // Confirm database contains exactly 1 CONFIRMED reservation for this slot
      const confirmedCount = await prisma.reservation.count({
        where: {
          spaceId,
          startAt: startTime,
          endAt: endTime,
          status: "CONFIRMED",
        },
      });
      expect(confirmedCount).toBe(1);
    }
  }, 60000);
});
