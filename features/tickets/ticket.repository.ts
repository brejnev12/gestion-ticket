import prisma from "@/lib/prisma";
import { UpdateTicket } from "./ticket.type";

export async function createTicket(data: {
  title: string;
  description: string;
  userId: number;
}) {
  return prisma.ticket.create({
    data,
  });
}
export async function findTicketsByUser(userId: number) {
  return prisma.ticket.findMany({
    where: {
      userId,
    },
  });
}
export async function findTicketById(id: number, userId: number) {
  return prisma.ticket.findFirst({
    where: {
      id,
      userId,
    },
  });
}
export async function updateTicket(id: number, data: UpdateTicket) {
  return prisma.ticket.update({
    where: {
      id,
    },
    data,
  });
}
export async function deleteTicket(id: number) {
  return prisma.ticket.delete({
    where: {
      id,
    },
  });
}
