import { isValidObjectId, type FilterQuery } from "mongoose";
import type { CreateTicketData, ListTicketsQuery, TicketPagination, TicketSummary, UpdateTicketData } from "../domain/ticket.types.js";
import { TicketModel, type Ticket, type TicketDocument } from "./ticket.model.js";

type TicketFilter = FilterQuery<Ticket>;

export type ListTicketsResult = {
  tickets: TicketDocument[];
  pagination: TicketPagination;
  summary: TicketSummary;
};

const activeTicketsFilter = (): TicketFilter => ({ deleted_at: null });

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildListFilter = (query: ListTicketsQuery): TicketFilter => {
  const filter: TicketFilter = activeTicketsFilter();

  for (const field of ["hotel_id", "status", "priority", "channel", "assigned_to"] as const) {
    if (query[field]) {
      filter[field] = query[field];
    }
  }

  if (query.q) {
    const escapedQuery = escapeRegex(query.q);
    filter.$or = [
      { subject: { $regex: escapedQuery, $options: "i" } },
      { description: { $regex: escapedQuery, $options: "i" } }
    ];
  }

  return filter;
};

const withListMetric = (filter: TicketFilter, metricFilter: TicketFilter): TicketFilter => ({
  $and: [filter, metricFilter]
});

export const createTicket = async (input: CreateTicketData): Promise<TicketDocument> => TicketModel.create(input);

export const listTickets = async (query: ListTicketsQuery): Promise<ListTicketsResult> => {
  const filter = buildListFilter(query);
  const skip = (query.page - 1) * query.page_size;

  const [tickets, total, openCircuits, urgentLoad, assignedTickets] = await Promise.all([
    TicketModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(query.page_size),
    TicketModel.countDocuments(filter),
    TicketModel.countDocuments(withListMetric(filter, { status: { $in: ["open", "in_progress"] } })),
    TicketModel.countDocuments(withListMetric(filter, { priority: "urgent" })),
    TicketModel.countDocuments(withListMetric(filter, { assigned_to: { $ne: null } }))
  ]);

  return {
    tickets,
    pagination: {
      page: query.page,
      page_size: query.page_size,
      total,
      total_pages: Math.ceil(total / query.page_size)
    },
    summary: {
      open_circuits: openCircuits,
      urgent_load: urgentLoad,
      assigned_tickets: assignedTickets
    }
  };
};

export const findActiveTicketById = async (id: string): Promise<TicketDocument | null> => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return TicketModel.findOne({ _id: id, ...activeTicketsFilter() });
};

export const updateActiveTicket = async (id: string, input: UpdateTicketData): Promise<TicketDocument | null> => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return TicketModel.findOneAndUpdate({ _id: id, ...activeTicketsFilter() }, { $set: input }, { new: true, runValidators: true });
};

export const softDeleteActiveTicket = async (id: string): Promise<TicketDocument | null> => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return TicketModel.findOneAndUpdate({ _id: id, ...activeTicketsFilter() }, { $set: { deleted_at: new Date() } }, { new: true });
};
