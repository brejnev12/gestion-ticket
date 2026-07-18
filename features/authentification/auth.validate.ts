import { z } from "zod";

export const registerValidate = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export const loginValidate = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

