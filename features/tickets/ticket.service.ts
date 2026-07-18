import {createTicket, findTicketsByUser,findTicketById,updateTicket,deleteTicket,} from "./ticket.repository";
import { UpdateTicket } from "./ticket.type";

export async function create(
  data: {
    title: string;
    description: string;
  },
  userId: number,
) {
  return createTicket({
    ...data,
    userId,
  });
}
export async function getAll(userId: number) {
  return findTicketsByUser(userId);
}
export async function getById(id: number, userId: number) {
  const ticket = await findTicketById(id, userId);
  if (!ticket) {
    throw new Error("Ticket introuvable");
  }
  return ticket;
}
export async function update(id: number, userId: number, data: UpdateTicket) {
  const ticket = await findTicketById(id, userId);
  if (!ticket) {
    throw new Error("Accès interdit");
  }
  return updateTicket(id, data);
}
export async function remove(id: number, userId: number) {
  const ticket = await findTicketById(id, userId);
  if (!ticket) {
    throw new Error("Accès interdit");
  }
  return deleteTicket(id);
}
