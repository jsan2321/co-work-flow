import { z } from "zod";

export const auditLogFilterSchema = z
  .object({
    entityType: z.string().optional(),
    action: z.string().optional(),
    actorUserId: z.string().uuid({ message: "actorUserId must be a valid UUID" }).optional(),
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
