import type { UpdateTicketData } from "../domain/ticket.types.js";
import { updateActiveTicket } from "../infra/ticket.repository.js";
import type { TicketDocument } from "../infra/ticket.model.js";

export const updateTicket = async (id: string, input: UpdateTicketData): Promise<TicketDocument | null> => updateActiveTicket(id, input);
