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

export const adminCancelReservationSchema = z.object({
  reason: z
    .string()
    .min(5, { message: "Cancellation reason must be at least 5 characters" })
    .max(500, { message: "Cancellation reason cannot exceed 500 characters" }),
});

export const adminReservationFilterSchema = z
  .object({
    spaceId: z.string().uuid({ message: "spaceId must be a valid UUID" }).optional(),
    userId: z.string().uuid({ message: "userId must be a valid UUID" }).optional(),
    status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
    from: z.string().datetime({ message: "from must be a valid ISO 8601 datetime" }).optional(),
    to: z.string().datetime({ message: "to must be a valid ISO 8601 datetime" }).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.to).getTime() >= new Date(data.from).getTime();
      }
      return true;
    },
    {
      message: "to must be on or after from",
      path: ["to"],
    }
  );

