import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name cannot be empty")
      .max(100, "First name cannot exceed 100 characters")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name cannot be empty")
      .max(100, "Last name cannot exceed 100 characters")
      .optional(),
  })
  .refine((data) => data.firstName !== undefined || data.lastName !== undefined, {
    message: "At least one field (firstName or lastName) must be provided for update",
  });

export const adminUserFilterSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DEACTIVATED"], {
    errorMap: () => ({ message: "Status must be ACTIVE or DEACTIVATED" }),
  }),
});
