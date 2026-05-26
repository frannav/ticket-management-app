import type { CreateTicketData } from "../domain/ticket.types.js";
import { createTicket as createTicketRecord } from "../infra/ticket.repository.js";
import type { TicketDocument } from "../infra/ticket.model.js";

export const createTicket = async (input: CreateTicketData): Promise<TicketDocument> => createTicketRecord(input);
