import { z } from "zod";

export const createTicketValidate = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
});
export const updateTicketValidate = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  status: z.enum(["OPEN","CLOSED"]).optional(),
});
