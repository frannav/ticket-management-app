import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/errors.js";
import {
  createTicketHandler,
  getTicketByIdHandler,
  listTicketsHandler,
  softDeleteTicketHandler,
  updateTicketHandler
} from "./ticket.controller.js";
import { createTicketSchema, listTicketsQuerySchema, updateTicketSchema } from "./ticket.schemas.js";

export const ticketRouter = Router();

ticketRouter.post("/", validateBody(createTicketSchema), createTicketHandler);
ticketRouter.get("/", validateQuery(listTicketsQuerySchema), listTicketsHandler);
ticketRouter.get("/:id", getTicketByIdHandler);
ticketRouter.patch("/:id", validateBody(updateTicketSchema), updateTicketHandler);
ticketRouter.delete("/:id", softDeleteTicketHandler);
