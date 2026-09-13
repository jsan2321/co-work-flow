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
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const availabilityQuerySchema = z
  .object({
    startDate: z
      .string()
      .datetime({ message: "startDate must be an ISO 8601 UTC timestamp" }),
    endDate: z
      .string()
      .datetime({ message: "endDate must be an ISO 8601 UTC timestamp" }),
  })
  .refine(
    (data) => new Date(data.endDate).getTime() > new Date(data.startDate).getTime(),
    {
      message: "endDate must be strictly after startDate",
      path: ["endDate"],
    }
  );
