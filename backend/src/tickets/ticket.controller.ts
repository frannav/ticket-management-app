import type { NextFunction, Request, Response } from "express";
import { notFoundHandler } from "../middleware/errors.js";
import type { ListTicketsQuery } from "./domain/ticket.types.js";
import { serializeTicket } from "./ticket.serializer.js";
import { createTicket } from "./use-cases/create-ticket.js";
import { getTicketById } from "./use-cases/get-ticket-by-id.js";
import { listTickets } from "./use-cases/list-tickets.js";
import { softDeleteTicket } from "./use-cases/soft-delete-ticket.js";
import { updateTicket } from "./use-cases/update-ticket.js";

const ticketNotFound = () => notFoundHandler("Ticket not found");

export const createTicketHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await createTicket(req.body);
    res.status(201).json(serializeTicket(ticket));
  } catch (error) {
    next(error);
  }
};

export const listTicketsHandler = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = res.locals.query as ListTicketsQuery;
    const result = await listTickets(query);

    res.json({
      data: result.tickets.map(serializeTicket),
      pagination: result.pagination,
      summary: result.summary
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await getTicketById(req.params.id ?? "");
    if (!ticket) {
      next(ticketNotFound());
      return;
    }

    res.json(serializeTicket(ticket));
  } catch (error) {
    next(error);
  }
};

export const updateTicketHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await updateTicket(req.params.id ?? "", req.body);
    if (!ticket) {
      next(ticketNotFound());
      return;
    }

    res.json(serializeTicket(ticket));
  } catch (error) {
    next(error);
  }
};

export const softDeleteTicketHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await softDeleteTicket(req.params.id ?? "");
    if (!ticket) {
      next(ticketNotFound());
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
