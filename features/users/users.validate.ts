import { z } from "zod";

export const updateUserValidate = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
});