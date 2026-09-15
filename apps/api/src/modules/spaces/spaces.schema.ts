import { z } from "zod";

export const spaceFilterSchema = z.object({
  type: z.enum(["DESK", "MEETING_ROOM", "PRIVATE_OFFICE"]).optional(),
  minCapacity: z.coerce.number().int().positive().optional(),
  amenities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const availabilityQuerySchema = z
  .object({
    startDate: z.string().datetime({ message: "startDate must be an ISO 8601 UTC timestamp" }),
    endDate: z.string().datetime({ message: "endDate must be an ISO 8601 UTC timestamp" }),
  })
  .refine((data) => new Date(data.endDate).getTime() > new Date(data.startDate).getTime(), {
    message: "endDate must be strictly after startDate",
    path: ["endDate"],
  });

export const createSpaceSchema = z.object({
  locationId: z.string().uuid({ message: "locationId must be a valid UUID" }),
  name: z.string().min(1, { message: "name is required" }).max(100),
  type: z.enum(["DESK", "MEETING_ROOM", "PRIVATE_OFFICE"]),
  capacity: z.number().int().min(1, { message: "capacity must be at least 1" }),
  description: z.string().max(1000).optional(),
  amenities: z.array(z.string()).default([]),
});

export const updateSpaceSchema = z.object({
  locationId: z.string().uuid({ message: "locationId must be a valid UUID" }).optional(),
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["DESK", "MEETING_ROOM", "PRIVATE_OFFICE"]).optional(),
  capacity: z.number().int().min(1).optional(),
  description: z.string().max(1000).optional(),
  amenities: z.array(z.string()).optional(),
});

export const updateSpaceStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
