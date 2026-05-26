import { findActiveTicketById } from "../infra/ticket.repository.js";
import type { TicketDocument } from "../infra/ticket.model.js";

export const getTicketById = async (id: string): Promise<TicketDocument | null> => findActiveTicketById(id);
