import { z } from "zod";
import { ticketChannels, ticketPriorities, ticketStatuses } from "./ticket.types.js";

const nonEmpty = z.string().trim().min(1);

export const createTicketSchema = z
  .object({
    hotel_id: nonEmpty,
    subject: nonEmpty.max(200),
    description: nonEmpty,
    channel: z.enum(ticketChannels),
    status: z.enum(ticketStatuses).optional(),
    priority: z.enum(ticketPriorities),
    assigned_to: z.string().trim().min(1).nullable().optional()
  })
  .strict();

export const updateTicketSchema = z
  .object({
    hotel_id: nonEmpty.optional(),
    subject: nonEmpty.max(200).optional(),
    description: nonEmpty.optional(),
    channel: z.enum(ticketChannels).optional(),
    status: z.enum(ticketStatuses).optional(),
    priority: z.enum(ticketPriorities).optional(),
    assigned_to: z.string().trim().min(1).nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one mutable field is required"
  });

export const listTicketsQuerySchema = z.object({
  hotel_id: nonEmpty.optional(),
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  channel: z.enum(ticketChannels).optional(),
  assigned_to: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100, "page_size must be less than or equal to 100").default(20)
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
