import { prisma } from "./client.js";
import { applyGistConstraint } from "./apply-gist-constraint.js";
import { hashPassword } from "../shared/utils/crypto.js";

export async function seed(): Promise<{
  locationId: string;
  adminId: string;
  memberId: string;
}> {
  // Ensure PostgreSQL exclusion constraint is applied
  await applyGistConstraint();

  // 1. Seed MVP Location
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

  // 2. Seed Spaces
  const initialSpaces = [
    {
      id: "00000000-0000-0000-0001-000000000001",
      name: "Focus Desk 01",
      type: "DESK" as const,
      capacity: 1,
      description: "Dedicated quiet desk with dual monitors and ergonomic task chair.",
      amenities: ["Ergonomic Chair", "Dual Monitors", "High-Speed WiFi", "Power Outlets"],
      status: "ACTIVE" as const,
    },
    {
      id: "00000000-0000-0000-0001-000000000002",
      name: "Focus Desk 02",
      type: "DESK" as const,
      capacity: 1,
      description: "Window-facing standing desk in the quiet mezzanine.",
      amenities: ["Standing Desk", "Ergonomic Chair", "High-Speed WiFi"],
      status: "ACTIVE" as const,
    },
    {
      id: "00000000-0000-0000-0001-000000000003",
      name: "Boardroom Alpha",
      type: "MEETING_ROOM" as const,
      capacity: 10,
      description: "High-spec presentation boardroom with 4K display and teleconferencing.",
      amenities: ["Whiteboard", "4K Display", "Video Conferencing", "Conference Phone"],
      status: "ACTIVE" as const,
    },
    {
      id: "00000000-0000-0000-0001-000000000004",
      name: "Collaboration Studio B",
      type: "MEETING_ROOM" as const,
      capacity: 6,
      description: "Casual creative workshop space with mobile whiteboard walls.",
      amenities: ["Whiteboard", "Monitor", "Coffee Machine"],
      status: "ACTIVE" as const,
    },
    {
      id: "00000000-0000-0000-0001-000000000005",
      name: "Executive Office Suite",
      type: "PRIVATE_OFFICE" as const,
      capacity: 4,
      description: "Enclosed private team office with secure keycard entry.",
      amenities: ["Standing Desk", "Private Balcony", "Keycard Access", "Lounge Seating"],
      status: "ACTIVE" as const,
    },
  ];

  for (const space of initialSpaces) {
    await prisma.space.upsert({
      where: { id: space.id },
      update: {},
      create: {
        ...space,
        locationId: location.id,
      },
    });
  }

  // 3. Seed Users
  const adminPasswordHash = await hashPassword("AdminPassword123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@coworkflow.com" },
    update: {},
    create: {
      id: "00000000-0000-0000-0002-000000000001",
      email: "admin@coworkflow.com",
      passwordHash: adminPasswordHash,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const memberPasswordHash = await hashPassword("MemberPassword123!");
  const member = await prisma.user.upsert({
    where: { email: "member@coworkflow.com" },
    update: {},
    create: {
      id: "00000000-0000-0000-0002-000000000002",
      email: "member@coworkflow.com",
      passwordHash: memberPasswordHash,
      firstName: "Jane",
      lastName: "Doe",
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  return {
    locationId: location.id,
    adminId: admin.id,
    memberId: member.id,
  };
}

if (process.argv[1]?.includes("seed")) {
  seed()
    .then((result) => {
      console.log("Database seeded successfully:", result);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to seed database:", err);
      process.exit(1);
    });
}
