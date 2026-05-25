import type { CreateTicketPayload, Ticket, TicketListQuery, TicketListResponse, UpdateTicketPayload } from "../types/ticket";

const API_PATH = "/api/v1/tickets";
const DEFAULT_API_BASE_URL = "";

type BackendError = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
};

export class TicketApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, options: { status?: number; code?: string; details?: unknown } = {}) {
    super(message);
    this.name = "TicketApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

const configuredBaseUrl = (): string => {
  const value = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (value?.trim() || DEFAULT_API_BASE_URL).replace(/\/$/, "");
};

const apiBaseUrl = (): string => configuredBaseUrl() || window.location.origin;

export const buildTicketListUrl = (query: TicketListQuery = {}): URL => {
  const url = new URL(API_PATH, apiBaseUrl());
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.page_size) params.set("page_size", String(query.page_size));
  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);

  url.search = params.toString();
  return url;
};

const parseJsonSafely = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const normalizeError = (payload: unknown, status?: number): TicketApiError => {
  const body = payload as BackendError | null;
  const backendError = body?.error;
  const message = backendError?.message || body?.message || "Ticket request failed. Please try again.";

  return new TicketApiError(message, {
    status,
    code: backendError?.code,
    details: backendError?.details
  });
};

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
  } catch {
    throw new TicketApiError("Unable to reach the ticket API. Please check that the backend is running.");
  }

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw normalizeError(payload, response.status);
  }

  return payload as T;
};

export const listTickets = (query: TicketListQuery): Promise<TicketListResponse> => requestJson<TicketListResponse>(buildTicketListUrl(query));

export const createTicket = (payload: CreateTicketPayload): Promise<Ticket> =>
  requestJson<Ticket>(new URL(API_PATH, apiBaseUrl()), {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const patchTicket = (id: string, payload: UpdateTicketPayload): Promise<Ticket> =>
  requestJson<Ticket>(new URL(`${API_PATH}/${id}`, apiBaseUrl()), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
