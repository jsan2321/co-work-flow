import { prisma } from "../../src/prisma/client.js";
import { generateAccessToken } from "../../src/shared/utils/jwt.js";
import { hashPassword } from "../../src/shared/utils/crypto.js";

export async function seedTestUsersAndSpace() {
  const location = await prisma.location.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "CoWorkFlow Downtown HQ",
      address: "450 Mission St, San Francisco, CA 94105",
      timezone: "America/Los_Angeles",
      status: "ACTIVE",
    },
  });

  const suffix = Math.random().toString(36).substring(2, 8);
  const space = await prisma.space.create({
    data: {
      locationId: location.id,
      name: `Test Space ${Date.now()}_${suffix}`,
      type: "DESK",
      capacity: 1,
      description: "Dedicated quiet desk with dual monitors and ergonomic task chair.",
      amenities: ["Ergonomic Chair", "Dual Monitors"],
      status: "ACTIVE",
    },
  });

  const passwordHash = await hashPassword("MemberPassword123!");

  const emailA = `race_member_a_${Date.now()}_${suffix}@coworkflow.com`;
  const emailB = `race_member_b_${Date.now()}_${suffix}@coworkflow.com`;

  const userA = await prisma.user.create({
    data: {
      email: emailA,
      passwordHash,
      firstName: "Member",
      lastName: "Alpha",
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: emailB,
      passwordHash,
      firstName: "Member",
      lastName: "Beta",
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  const tokenA = generateAccessToken({
    sub: userA.id,
    email: userA.email,
    role: userA.role,
  });

  const tokenB = generateAccessToken({
    sub: userB.id,
    email: userB.email,
    role: userB.role,
  });

  return {
    spaceId: space.id,
    userA,
    userB,
    tokenA,
    tokenB,
  };
}

export async function seedAdminUser() {
  const suffix = Math.random().toString(36).substring(2, 8);
  const passwordHash = await hashPassword("AdminPassword123!");
  const adminEmail = `test_admin_${Date.now()}_${suffix}@coworkflow.com`;

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const adminToken = generateAccessToken({
    sub: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  });

  return {
    adminUser,
    adminToken,
  };
}
