import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildTicketListUrl, createTicket, listTickets, patchTicket, TicketApiError } from "./tickets";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });

describe("ticket API client", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE_URL", "https://tickets.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("builds GET requests from VITE_API_BASE_URL with pagination and filters", async () => {
    const fetchSpy = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: [],
        pagination: { page: 2, page_size: 10, total: 0, total_pages: 0 }
      })
    );
    vi.stubGlobal("fetch", fetchSpy);

    await listTickets({ page: 2, page_size: 10, status: "open", priority: "urgent" });

    const requestedUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(requestedUrl.origin).toBe("https://tickets.example.test");
    expect(requestedUrl.pathname).toBe("/api/v1/tickets");
    expect(requestedUrl.searchParams.get("page")).toBe("2");
    expect(requestedUrl.searchParams.get("page_size")).toBe("10");
    expect(requestedUrl.searchParams.get("status")).toBe("open");
    expect(requestedUrl.searchParams.get("priority")).toBe("urgent");
  });

  it("omits empty optional filters when serializing list queries", () => {
    const url = buildTicketListUrl({ page: 1, page_size: 20, status: "", priority: "" });

    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("page_size")).toBe("20");
    expect(url.searchParams.has("status")).toBe(false);
    expect(url.searchParams.has("priority")).toBe(false);
  });

  it("normalizes backend error responses into user-facing API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Request validation failed",
              details: [{ path: "subject", message: "Required" }]
            }
          },
          { status: 400 }
        )
      )
    );

    await expect(listTickets({ page: 1, page_size: 20 })).rejects.toMatchObject({
      name: "TicketApiError",
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Request validation failed"
    });
  });

  it("normalizes unexpected network failures without exposing stack traces", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new Error("socket hang up")));

    await expect(listTickets({ page: 1, page_size: 20 })).rejects.toThrow(TicketApiError);
    await expect(listTickets({ page: 1, page_size: 20 })).rejects.toThrow("Unable to reach the ticket API");
  });

  it("creates and patches tickets through the existing backend endpoints", async () => {
    const ticketPayload = {
      id: "ticket-1",
      hotel_id: "hotel-1",
      subject: "Leaking sink",
      description: "Guest reported a leak",
      channel: "phone",
      status: "open",
      priority: "high",
      assigned_to: null,
      created_at: "2026-05-25T10:00:00.000Z",
      updated_at: "2026-05-25T10:00:00.000Z",
      deleted_at: null
    };
    const fetchSpy = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(ticketPayload))
      .mockResolvedValueOnce(jsonResponse({ ...ticketPayload, subject: "Fixed sink" }));
    vi.stubGlobal("fetch", fetchSpy);

    await createTicket({
      hotel_id: "hotel-1",
      subject: "Leaking sink",
      description: "Guest reported a leak",
      channel: "phone",
      priority: "high"
    });
    await patchTicket("ticket-1", { subject: "Fixed sink" });

    expect(String(fetchSpy.mock.calls[0][0])).toBe("https://tickets.example.test/api/v1/tickets");
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: "POST" });
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toMatchObject({
      hotel_id: "hotel-1",
      subject: "Leaking sink",
      description: "Guest reported a leak",
      channel: "phone",
      priority: "high"
    });
    expect(String(fetchSpy.mock.calls[1][0])).toBe("https://tickets.example.test/api/v1/tickets/ticket-1");
    expect(fetchSpy.mock.calls[1][1]).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(String(fetchSpy.mock.calls[1][1]?.body))).toEqual({ subject: "Fixed sink" });
  });
});
