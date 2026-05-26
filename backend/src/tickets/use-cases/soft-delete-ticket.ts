import { softDeleteActiveTicket } from "../infra/ticket.repository.js";
import type { TicketDocument } from "../infra/ticket.model.js";

export const softDeleteTicket = async (id: string): Promise<TicketDocument | null> => softDeleteActiveTicket(id);
