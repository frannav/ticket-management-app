import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TicketListView from "./TicketListView.vue";
import { mountWithVuetify } from "../test/mount";
import type { Ticket, TicketListResponse } from "../types/ticket";

const ticket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: "ticket-1",
  hotel_id: "hotel-1",
  subject: "Broken air conditioning",
  description: "Room is too warm",
  channel: "phone",
  status: "open",
  priority: "high",
  assigned_to: null,
  created_at: "2026-05-25T10:00:00.000Z",
  updated_at: "2026-05-25T10:00:00.000Z",
  deleted_at: null,
  ...overrides
});

const listResponse = (tickets: Ticket[], pagination = { page: 1, page_size: 20, total: tickets.length, total_pages: Math.max(tickets.length, 1) }): TicketListResponse => ({
  data: tickets,
  pagination
});

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const waitForLoaded = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const setViewportWidth = (width: number) => {
  vi.stubGlobal("innerWidth", width);
  window.dispatchEvent(new Event("resize"));
};

describe("TicketListView", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE_URL", "https://tickets.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });


  it.each([
    ["desktop", 1280],
    ["tablet", 768],
    ["mobile", 390]
  ])("keeps the core ticket workflow reachable on %s width", async (_label, width) => {
    setViewportWidth(width);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(listResponse([ticket()]))));

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    expect(wrapper.text()).toContain("Ticket management");
    expect(wrapper.find('select[aria-label="Status filter"]').exists()).toBe(true);
    expect(wrapper.find('select[aria-label="Priority filter"]').exists()).toBe(true);
    expect(wrapper.findAll("button").some((button) => button.text().includes("Create ticket"))).toBe(true);
    expect(wrapper.text()).toContain("Broken air conditioning");
    expect(wrapper.text()).toContain("Page 1 of 1");
  });

  it("keeps the ticket list readable and actionable through a scrollable region on narrow screens", async () => {
    setViewportWidth(390);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(listResponse([ticket()]))));

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    const listRegion = wrapper.find('[role="region"][aria-label="Scrollable ticket list"]');
    expect(listRegion.exists()).toBe(true);
    expect(listRegion.text()).toContain("Subject");
    expect(listRegion.text()).toContain("Broken air conditioning");
    expect(listRegion.findAll("button").some((button) => button.text().includes("Edit Broken air conditioning"))).toBe(true);
  });

  it("keeps filters operable in the responsive filter group while preserving query and page reset behavior", async () => {
    setViewportWidth(390);
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket()], { page: 1, page_size: 20, total: 2, total_pages: 2 })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Second page" })], { page: 2, page_size: 20, total: 2, total_pages: 2 })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Mobile status filtered", status: "in_progress" })], { page: 1, page_size: 20, total: 1, total_pages: 1 })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Mobile filtered", status: "in_progress", priority: "low" })], { page: 1, page_size: 20, total: 1, total_pages: 1 })));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const filters = wrapper.find('form[aria-label="Ticket filters"]');
    expect(filters.classes()).toContain("ticket-filters--responsive");

    const pageTwo = wrapper.findAll("button").find((button) => button.text().includes("Page 2"));
    await pageTwo!.trigger("click");
    await waitForLoaded();

    await wrapper.find('select[aria-label="Status filter"]').setValue("in_progress");
    await wrapper.find('select[aria-label="Priority filter"]').setValue("low");
    await waitForLoaded();

    const requestedUrl = new URL(String(fetchSpy.mock.calls.at(-1)?.[0]));
    expect(requestedUrl.searchParams.get("page")).toBe("1");
    expect(requestedUrl.searchParams.get("status")).toBe("in_progress");
    expect(requestedUrl.searchParams.get("priority")).toBe("low");
    expect(wrapper.text()).toContain("Mobile filtered");
  });

  it("keeps create and edit forms usable in mobile-friendly dialogs", async () => {
    setViewportWidth(390);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(listResponse([ticket({ subject: "Editable mobile ticket" })]))));

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    const createButton = wrapper.findAll("button").find((button) => button.text().includes("Create ticket"));
    await createButton!.trigger("click");
    await waitForLoaded();

    const createDialog = wrapper.find('[role="dialog"][aria-label="Create ticket"]');
    expect(createDialog.classes()).toContain("ticket-dialog--mobile-friendly");
    expect(createDialog.find('input[aria-label="Hotel ID"]').exists()).toBe(true);
    expect(createDialog.find('textarea[aria-label="Description"]').exists()).toBe(true);
    expect(createDialog.findAll("button").some((button) => button.text() === "Create")).toBe(true);
    expect(createDialog.findAll("button").some((button) => button.text() === "Cancel")).toBe(true);

    await createDialog.findAll("button").find((button) => button.text() === "Cancel")!.trigger("click");
    await waitForLoaded();
    const editButton = wrapper.findAll("button").find((button) => button.text().includes("Edit Editable mobile ticket"));
    await editButton!.trigger("click");
    await waitForLoaded();

    const editDialog = wrapper.find('[role="dialog"][aria-label="Edit ticket"]');
    expect(editDialog.classes()).toContain("ticket-dialog--mobile-friendly");
    expect((editDialog.find('input[aria-label="Subject"]').element as HTMLInputElement).value).toBe("Editable mobile ticket");
    expect(editDialog.findAll("button").some((button) => button.text().includes("Save changes"))).toBe(true);
  });

  it.each([
    ["loading", 390],
    ["empty", 768],
    ["error", 1280]
  ])("keeps the %s list state readable in a responsive state container", async (state, width) => {
    setViewportWidth(width);

    if (state === "loading") {
      const request = deferred<Response>();
      vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));
      const wrapper = mountWithVuetify(TicketListView);
      await flushPromises();
      expect(wrapper.find('[data-testid="ticket-list-state"]').text()).toContain("Loading tickets...");
      request.resolve(jsonResponse(listResponse([])));
      return;
    }

    if (state === "empty") {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(listResponse([]))));
      const wrapper = mountWithVuetify(TicketListView);
      await waitForLoaded();
      expect(wrapper.find('[data-testid="ticket-list-state"]').text()).toContain("No tickets found for the current query.");
      return;
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: { message: "Readable failure" } }, { status: 500 })));
    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const stateContainer = wrapper.find('[data-testid="ticket-list-state"]');
    expect(stateContainer.text()).toContain("Readable failure");
    expect(stateContainer.findAll("button").some((button) => button.text().includes("Retry"))).toBe(true);
  });

  it("shows a loading state while the list request is pending", async () => {
    const request = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));

    const wrapper = mountWithVuetify(TicketListView);
    await flushPromises();

    expect(wrapper.text()).toContain("Loading tickets...");

    request.resolve(jsonResponse(listResponse([])));
    await waitForLoaded();
    expect(wrapper.text()).not.toContain("Loading tickets...");
  });

  it("renders returned tickets in a table with required columns and clear unassigned value", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(listResponse([ticket({ assigned_to: null })]))));

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    expect(wrapper.text()).toContain("Subject");
    expect(wrapper.text()).toContain("Channel");
    expect(wrapper.text()).toContain("Status");
    expect(wrapper.text()).toContain("Priority");
    expect(wrapper.text()).toContain("Assigned to");
    expect(wrapper.text()).toContain("Created at");
    expect(wrapper.text()).toContain("Broken air conditioning");
    expect(wrapper.text()).toContain("phone");
    expect(wrapper.text()).toContain("open");
    expect(wrapper.text()).toContain("high");
    expect(wrapper.text()).toContain("Unassigned");
  });

  it("shows an empty state and no stale rows when the API returns no tickets", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Old ticket" })])))
      .mockResolvedValueOnce(jsonResponse(listResponse([], { page: 1, page_size: 20, total: 0, total_pages: 0 })));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    expect(wrapper.text()).toContain("Old ticket");

    await wrapper.find('select[aria-label="Status filter"]').setValue("open");
    await waitForLoaded();

    expect(wrapper.text()).toContain("No tickets found for the current query.");
    expect(wrapper.text()).not.toContain("Old ticket");
  });

  it("shows a user-facing error state with a retry path on API failure", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: { message: "Database temporarily unavailable" } }, { status: 503 }))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Recovered ticket" })])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    expect(wrapper.text()).toContain("Database temporarily unavailable");

    const retry = wrapper.findAll("button").find((button) => button.text().includes("Retry"));
    expect(retry).toBeTruthy();
    await retry!.trigger("click");
    await waitForLoaded();

    expect(wrapper.text()).toContain("Recovered ticket");
  });

  it("selecting a status filter sends the status query parameter and renders filtered results", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Initial ticket" })])))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Resolved ticket", status: "resolved" })])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    await wrapper.find('select[aria-label="Status filter"]').setValue("resolved");
    await waitForLoaded();

    const requestedUrl = new URL(String(fetchSpy.mock.calls[1][0]));
    expect(requestedUrl.searchParams.get("status")).toBe("resolved");
    expect(wrapper.text()).toContain("Resolved ticket");
  });

  it("clearing the status filter omits status from the next query", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket()])))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Filtered ticket", status: "closed" })])))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Unfiltered ticket" })])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    await wrapper.find('select[aria-label="Status filter"]').setValue("closed");
    await waitForLoaded();
    await wrapper.find('select[aria-label="Status filter"]').setValue("");
    await waitForLoaded();

    const requestedUrl = new URL(String(fetchSpy.mock.calls[2][0]));
    expect(requestedUrl.searchParams.has("status")).toBe(false);
    expect(wrapper.text()).toContain("Unfiltered ticket");
  });

  it("selecting and clearing a priority filter updates the query and rendered results", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket()])))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Urgent ticket", priority: "urgent" })])))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Any priority ticket" })])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    await wrapper.find('select[aria-label="Priority filter"]').setValue("urgent");
    await waitForLoaded();

    let requestedUrl = new URL(String(fetchSpy.mock.calls[1][0]));
    expect(requestedUrl.searchParams.get("priority")).toBe("urgent");
    expect(wrapper.text()).toContain("Urgent ticket");

    await wrapper.find('select[aria-label="Priority filter"]').setValue("");
    await waitForLoaded();

    requestedUrl = new URL(String(fetchSpy.mock.calls[2][0]));
    expect(requestedUrl.searchParams.has("priority")).toBe(false);
    expect(wrapper.text()).toContain("Any priority ticket");
  });

  it("uses page one initially and displays pagination metadata", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      jsonResponse(
        listResponse([ticket()], {
          page: 1,
          page_size: 20,
          total: 42,
          total_pages: 3
        })
      )
    );
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    const requestedUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("page")).toBe("1");
    expect(wrapper.text()).toContain("Page 1 of 3 · 42 total tickets");
  });

  it("changing page sends the selected page query parameter and renders page results", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Page one" })], { page: 1, page_size: 20, total: 2, total_pages: 2 })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Page two" })], { page: 2, page_size: 20, total: 2, total_pages: 2 })));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();

    const pageTwo = wrapper.findAll("button").find((button) => button.text().includes("Page 2"));
    expect(pageTwo).toBeTruthy();
    await pageTwo!.trigger("click");
    await waitForLoaded();

    const requestedUrl = new URL(String(fetchSpy.mock.calls[1][0]));
    expect(requestedUrl.searchParams.get("page")).toBe("2");
    expect(wrapper.text()).toContain("Page two");
  });

  it("changing filters resets pagination to page one", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Page one" })], { page: 1, page_size: 20, total: 2, total_pages: 2 })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Page two" })], { page: 2, page_size: 20, total: 2, total_pages: 2 })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ subject: "Filtered first page", status: "open" })], { page: 1, page_size: 20, total: 1, total_pages: 1 })));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const pageTwo = wrapper.findAll("button").find((button) => button.text().includes("Page 2"));
    await pageTwo!.trigger("click");
    await waitForLoaded();
    await wrapper.find('select[aria-label="Status filter"]').setValue("open");
    await waitForLoaded();

    const requestedUrl = new URL(String(fetchSpy.mock.calls[2][0]));
    expect(requestedUrl.searchParams.get("page")).toBe("1");
    expect(wrapper.text()).toContain("Filtered first page");
  });

  it("submitting an empty create form shows validation messages and does not call POST", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(listResponse([])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const createButton = wrapper.findAll("button").find((button) => button.text().includes("Create ticket"));
    await createButton!.trigger("click");
    await waitForLoaded();
    const submitButton = wrapper.findAll("button").find((button) => button.text() === "Create");
    await submitButton!.trigger("click");
    await waitForLoaded();

    expect(wrapper.text()).toContain("Hotel ID is required");
    expect(wrapper.text()).toContain("Subject is required");
    expect(wrapper.text()).toContain("Description is required");
    expect(wrapper.text()).toContain("Channel is required");
    expect(wrapper.text()).toContain("Priority is required");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejects a subject longer than 200 characters before calling the API", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(listResponse([])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const createButton = wrapper.findAll("button").find((button) => button.text().includes("Create ticket"));
    await createButton!.trigger("click");
    await waitForLoaded();

    await wrapper.find('input[aria-label="Hotel ID"]').setValue("hotel-1");
    await wrapper.find('input[aria-label="Subject"]').setValue("x".repeat(201));
    await wrapper.find('textarea[aria-label="Description"]').setValue("Description");
    await wrapper.find('select[aria-label="Channel"]').setValue("email");
    await wrapper.find('select[aria-label="Priority"]').setValue("medium");
    const submitButton = wrapper.findAll("button").find((button) => button.text() === "Create");
    await submitButton!.trigger("click");
    await waitForLoaded();

    expect(wrapper.text()).toContain("Subject must be 200 characters or fewer");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("submits a valid create payload, refreshes the list, and closes the form", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([])))
      .mockResolvedValueOnce(jsonResponse(ticket({ id: "created-ticket", subject: "New ticket", priority: "medium", channel: "email" }), { status: 201 }))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ id: "created-ticket", subject: "New ticket", priority: "medium", channel: "email" })])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const createButton = wrapper.findAll("button").find((button) => button.text().includes("Create ticket"));
    await createButton!.trigger("click");
    await waitForLoaded();

    await wrapper.find('input[aria-label="Hotel ID"]').setValue("hotel-1");
    await wrapper.find('input[aria-label="Subject"]').setValue("New ticket");
    await wrapper.find('textarea[aria-label="Description"]').setValue("A guest needs help");
    await wrapper.find('select[aria-label="Channel"]').setValue("email");
    await wrapper.find('select[aria-label="Priority"]').setValue("medium");
    const submitButton = wrapper.findAll("button").find((button) => button.text() === "Create");
    await submitButton!.trigger("click");
    await waitForLoaded();

    expect(String(fetchSpy.mock.calls[1][0])).toBe("https://tickets.example.test/api/v1/tickets");
    expect(fetchSpy.mock.calls[1][1]).toMatchObject({ method: "POST" });
    expect(JSON.parse(String(fetchSpy.mock.calls[1][1]?.body))).toEqual({
      hotel_id: "hotel-1",
      subject: "New ticket",
      description: "A guest needs help",
      channel: "email",
      priority: "medium"
    });
    expect(wrapper.text()).toContain("New ticket");
    expect(wrapper.find('input[aria-label="Hotel ID"]').exists()).toBe(false);
  });

  it("shows create API failures and preserves entered values", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([])))
      .mockResolvedValueOnce(jsonResponse({ error: { message: "Create validation failed" } }, { status: 400 }));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const createButton = wrapper.findAll("button").find((button) => button.text().includes("Create ticket"));
    await createButton!.trigger("click");
    await waitForLoaded();

    await wrapper.find('input[aria-label="Hotel ID"]').setValue("hotel-1");
    await wrapper.find('input[aria-label="Subject"]').setValue("Preserved subject");
    await wrapper.find('textarea[aria-label="Description"]').setValue("Still in form");
    await wrapper.find('select[aria-label="Channel"]').setValue("chat");
    await wrapper.find('select[aria-label="Priority"]').setValue("high");
    const submitButton = wrapper.findAll("button").find((button) => button.text() === "Create");
    await submitButton!.trigger("click");
    await waitForLoaded();

    expect(wrapper.text()).toContain("Create validation failed");
    expect((wrapper.find('input[aria-label="Subject"]').element as HTMLInputElement).value).toBe("Preserved subject");
  });

  it("opens edit with existing values populated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(listResponse([ticket({ subject: "Original subject", assigned_to: "Ana" })]))));

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const editButton = wrapper.findAll("button").find((button) => button.text().includes("Edit Original subject"));
    await editButton!.trigger("click");
    await waitForLoaded();

    expect((wrapper.find('input[aria-label="Subject"]').element as HTMLInputElement).value).toBe("Original subject");
    expect((wrapper.find('input[aria-label="Assigned to"]').element as HTMLInputElement).value).toBe("Ana");
  });

  it("submits valid edits through PATCH and reflects updated ticket data after refresh", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ id: "ticket-1", subject: "Original subject" })])))
      .mockResolvedValueOnce(jsonResponse(ticket({ id: "ticket-1", subject: "Updated subject", priority: "urgent" })))
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ id: "ticket-1", subject: "Updated subject", priority: "urgent" })])));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const editButton = wrapper.findAll("button").find((button) => button.text().includes("Edit Original subject"));
    await editButton!.trigger("click");
    await waitForLoaded();

    await wrapper.find('input[aria-label="Subject"]').setValue("Updated subject");
    await wrapper.find('select[aria-label="Priority"]').setValue("urgent");
    const submitButton = wrapper.findAll("button").find((button) => button.text().includes("Save changes"));
    await submitButton!.trigger("click");
    await waitForLoaded();

    expect(String(fetchSpy.mock.calls[1][0])).toBe("https://tickets.example.test/api/v1/tickets/ticket-1");
    expect(fetchSpy.mock.calls[1][1]).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(String(fetchSpy.mock.calls[1][1]?.body))).toMatchObject({
      subject: "Updated subject",
      priority: "urgent"
    });
    expect(wrapper.text()).toContain("Updated subject");
    expect(wrapper.text()).not.toContain("Original subject");
  });

  it("shows edit API failures without replacing the row with unconfirmed data", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(listResponse([ticket({ id: "ticket-1", subject: "Original subject" })])))
      .mockResolvedValueOnce(jsonResponse({ error: { message: "Edit failed" } }, { status: 500 }));
    vi.stubGlobal("fetch", fetchSpy);

    const wrapper = mountWithVuetify(TicketListView);
    await waitForLoaded();
    const editButton = wrapper.findAll("button").find((button) => button.text().includes("Edit Original subject"));
    await editButton!.trigger("click");
    await waitForLoaded();

    await wrapper.find('input[aria-label="Subject"]').setValue("Unconfirmed subject");
    const submitButton = wrapper.findAll("button").find((button) => button.text().includes("Save changes"));
    await submitButton!.trigger("click");
    await waitForLoaded();

    expect(wrapper.text()).toContain("Edit failed");
    expect(wrapper.text()).toContain("Original subject");
  });
});
