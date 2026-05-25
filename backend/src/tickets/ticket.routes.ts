import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { notFoundHandler, validateBody, validateQuery } from "../middleware/errors.js";
import { TicketModel, type TicketDocument } from "./ticket.model.js";
import { createTicketSchema, listTicketsQuerySchema, type ListTicketsQuery, updateTicketSchema } from "./ticket.schemas.js";
import { serializeTicket } from "./ticket.serializer.js";

type TicketFilter = Record<string, unknown>;

export const ticketRouter = Router();

const notFound = () => notFoundHandler("Ticket not found");

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findActiveTicketById = async (id: string): Promise<TicketDocument | null> => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return TicketModel.findOne({ _id: id, deleted_at: null });
};

const buildListFilter = (query: ListTicketsQuery): TicketFilter => {
  const filter: TicketFilter = { deleted_at: null };

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

ticketRouter.post("/", validateBody(createTicketSchema), async (req, res, next) => {
  try {
    const ticket = await TicketModel.create(req.body);
    res.status(201).json(serializeTicket(ticket));
  } catch (error) {
    next(error);
  }
});

ticketRouter.get("/", validateQuery(listTicketsQuerySchema), async (_req, res, next) => {
  try {
    const query = res.locals.query as ListTicketsQuery;
    const filter = buildListFilter(query);
    const skip = (query.page - 1) * query.page_size;

    const [tickets, total] = await Promise.all([
      TicketModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(query.page_size),
      TicketModel.countDocuments(filter)
    ]);

    res.json({
      data: tickets.map(serializeTicket),
      pagination: {
        page: query.page,
        page_size: query.page_size,
        total,
        total_pages: Math.ceil(total / query.page_size)
      }
    });
  } catch (error) {
    next(error);
  }
});

ticketRouter.get("/:id", async (req, res, next) => {
  try {
    const ticket = await findActiveTicketById(req.params.id);
    if (!ticket) {
      next(notFound());
      return;
    }

    res.json(serializeTicket(ticket));
  } catch (error) {
    next(error);
  }
});

ticketRouter.patch("/:id", validateBody(updateTicketSchema), async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      next(notFound());
      return;
    }

    const ticket = await TicketModel.findOneAndUpdate({ _id: req.params.id, deleted_at: null }, { $set: req.body }, { new: true, runValidators: true });
    if (!ticket) {
      next(notFound());
      return;
    }

    res.json(serializeTicket(ticket));
  } catch (error) {
    next(error);
  }
});

ticketRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      next(notFound());
      return;
    }

    const ticket = await TicketModel.findOneAndUpdate({ _id: req.params.id, deleted_at: null }, { $set: { deleted_at: new Date() } }, { new: true });
    if (!ticket) {
      next(notFound());
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
