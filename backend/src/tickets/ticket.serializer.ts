import type { TicketDocument } from "./ticket.model.js";
import type { TicketResponse } from "./ticket.types.js";

const toIso = (value: Date): string => value.toISOString();

export const serializeTicket = (ticket: TicketDocument): TicketResponse => ({
  id: ticket._id.toString(),
  hotel_id: ticket.hotel_id,
  subject: ticket.subject,
  description: ticket.description,
  channel: ticket.channel,
  status: ticket.status,
  priority: ticket.priority,
  assigned_to: ticket.assigned_to ?? null,
  created_at: toIso(ticket.created_at),
  updated_at: toIso(ticket.updated_at),
  deleted_at: ticket.deleted_at ? toIso(ticket.deleted_at) : null
});
