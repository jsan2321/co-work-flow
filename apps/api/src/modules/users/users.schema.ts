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
  .refine(
    (data) => data.firstName !== undefined || data.lastName !== undefined,
    {
      message: "At least one field (firstName or lastName) must be provided for update",
    }
  );
