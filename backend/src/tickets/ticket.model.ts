import { model, Schema, type HydratedDocument } from "mongoose";
import { ticketChannels, ticketPriorities, ticketStatuses, type TicketChannel, type TicketPriority, type TicketStatus } from "./ticket.types.js";

export type Ticket = {
  hotel_id: string;
  subject: string;
  description: string;
  channel: TicketChannel;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type TicketDocument = HydratedDocument<Ticket>;

const ticketSchema = new Schema<Ticket>(
  {
    hotel_id: { type: String, required: true, trim: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    channel: { type: String, required: true, enum: ticketChannels, index: true },
    status: { type: String, required: true, enum: ticketStatuses, default: "open", index: true },
    priority: { type: String, required: true, enum: ticketPriorities, index: true },
    assigned_to: { type: String, default: null, index: true },
    deleted_at: { type: Date, default: null, index: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

ticketSchema.index({ subject: "text", description: "text" });
ticketSchema.index({ deleted_at: 1, created_at: -1 });

export const TicketModel = model<Ticket>("Ticket", ticketSchema);
