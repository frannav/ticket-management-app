import type { ListTicketsQuery } from "../domain/ticket.types.js";
import { listTickets as listTicketRecords, type ListTicketsResult } from "../infra/ticket.repository.js";

export const listTickets = async (query: ListTicketsQuery): Promise<ListTicketsResult> => listTicketRecords(query);
