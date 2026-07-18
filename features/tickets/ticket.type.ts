import { Status } from "@/generated/prisma/client";

export type CreateTicket = {
  title: string;
  description: string;
};
export type UpdateTicket = {
  title?: string;
  description?: string;
  status?: Status;
};