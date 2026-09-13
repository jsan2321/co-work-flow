import { z } from "zod";

export const createReservationSchema = z
  .object({
    spaceId: z.string().uuid({ message: "spaceId must be a valid UUID" }),
    startAt: z.string().datetime({ message: "startAt must be a valid ISO 8601 datetime" }),
    endAt: z.string().datetime({ message: "endAt must be a valid ISO 8601 datetime" }),
    purpose: z.string().max(500, { message: "purpose cannot exceed 500 characters" }).optional(),
  })
  .refine(
    (data) => new Date(data.startAt).getTime() > Date.now(),
    {
      message: "startAt must be in the future",
      path: ["startAt"],
    }
  )
  .refine(
    (data) => new Date(data.endAt).getTime() > new Date(data.startAt).getTime(),
    {
      message: "endAt must be strictly after startAt",
      path: ["endAt"],
    }
  )
  .refine(
    (data) => {
      const diff = new Date(data.endAt).getTime() - new Date(data.startAt).getTime();
      return diff >= 30 * 60 * 1000;
    },
    {
      message: "Reservation duration must be at least 30 minutes",
      path: ["endAt"],
    }
  )
  .refine(
    (data) => {
      const diff = new Date(data.endAt).getTime() - new Date(data.startAt).getTime();
      return diff <= 8 * 60 * 60 * 1000;
    },
    {
      message: "Reservation duration cannot exceed 8 hours",
      path: ["endAt"],
    }
  );

export const reservationFilterSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
