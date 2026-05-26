export const ticketChannels = ["phone", "email", "chat", "social"] as const;
export const ticketStatuses = ["open", "in_progress", "resolved", "closed"] as const;
export const ticketPriorities = ["low", "medium", "high", "urgent"] as const;

export type TicketChannel = (typeof ticketChannels)[number];
export type TicketStatus = (typeof ticketStatuses)[number];
export type TicketPriority = (typeof ticketPriorities)[number];

export type TicketResponse = {
  id: string;
  hotel_id: string;
  subject: string;
  description: string;
  channel: TicketChannel;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CreateTicketData = {
  hotel_id: string;
  subject: string;
  description: string;
  channel: TicketChannel;
  status?: TicketStatus;
  priority: TicketPriority;
  assigned_to?: string | null;
};

export type UpdateTicketData = Partial<{
  hotel_id: string;
  subject: string;
  description: string;
  channel: TicketChannel;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
}>;

export type ListTicketsQuery = Partial<{
  hotel_id: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  assigned_to: string;
  q: string;
}> & {
  page: number;
  page_size: number;
};

export type TicketPagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type TicketSummary = {
  open_circuits: number;
  urgent_load: number;
  assigned_tickets: number;
};
