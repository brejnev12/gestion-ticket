import { createTicketValidate, updateTicketValidate } from "./ticket.validate";
import * as TicketService from "./ticket.service";

export async function create(body: unknown, userId: number) {
  const data = createTicketValidate.parse(body);
  return TicketService.create(data, userId);
}
export async function update(id: number, body: unknown, userId: number) {
  const data = updateTicketValidate.parse(body);
  return TicketService.update(id, userId, data);
}

export async function getAll(userId:number){
  return TicketService.getAll(userId);
}