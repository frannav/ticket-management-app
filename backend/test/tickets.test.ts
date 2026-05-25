import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { TicketModel } from "../src/tickets/ticket.model.js";
import { app, createTicket, expectStandardError, expectTicketShape, validTicketPayload } from "./helpers.js";

const missingObjectId = () => new mongoose.Types.ObjectId().toString();
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("POST /api/v1/tickets", () => {
  it("creates a valid ticket with generated fields and defaults", async () => {
    const response = await request(app).post("/api/v1/tickets").send(validTicketPayload());

    expect(response.status).toBe(201);
    expectTicketShape(response.body);
    expect(response.body).toMatchObject({
      hotel_id: "hotel-1",
      subject: "Guest needs extra towels",
      description: "Room 201 requested extra towels by phone.",
      channel: "phone",
      status: "open",
      priority: "medium",
      assigned_to: null,
      deleted_at: null
    });

    const persisted = await TicketModel.findById(response.body.id);
    expect(persisted).not.toBeNull();
  });

  it.each([
    ["missing required field", { subject: undefined }],
    ["invalid channel", { channel: "fax" }],
    ["invalid priority", { priority: "critical" }],
    ["subject over 200 characters", { subject: "x".repeat(201) }]
  ])("rejects invalid create payload: %s", async (_case, overrides) => {
    const payload = validTicketPayload(overrides);
    Object.entries(payload).forEach(([key, value]) => value === undefined && delete payload[key]);

    const response = await request(app).post("/api/v1/tickets").send(payload);

    expect(response.status).toBe(400);
    expectStandardError(response.body, "VALIDATION_ERROR");
    expect(await TicketModel.countDocuments()).toBe(0);
  });
});

describe("GET /api/v1/tickets", () => {
  it("returns non-deleted tickets with pagination metadata", async () => {
    const kept = await createTicket({ subject: "Visible ticket" });
    const deleted = await createTicket({ subject: "Deleted ticket" });
    await request(app).delete(`/api/v1/tickets/${deleted.id}`).expect(204);

    const response = await request(app).get("/api/v1/tickets");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 1,
      page_size: 20,
      total: 1,
      total_pages: 1
    });
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(kept.id);
  });

  it("filters tickets by hotel_id, status, priority, channel, and assigned_to", async () => {
    const target = await createTicket({
      hotel_id: "hotel-2",
      status: "in_progress",
      priority: "high",
      channel: "email",
      assigned_to: "agent-7"
    });
    await createTicket({ hotel_id: "hotel-2", status: "open", priority: "high", channel: "email", assigned_to: "agent-7" });
    await createTicket({ hotel_id: "hotel-3", status: "in_progress", priority: "high", channel: "email", assigned_to: "agent-7" });

    const response = await request(app)
      .get("/api/v1/tickets")
      .query({ hotel_id: "hotel-2", status: "in_progress", priority: "high", channel: "email", assigned_to: "agent-7" });

    expect(response.status).toBe(200);
    expect(response.body.data.map((ticket: { id: string }) => ticket.id)).toEqual([target.id]);
  });

  it("searches tickets by q across subject and description", async () => {
    const subjectMatch = await createTicket({ subject: "Air conditioning broken", description: "The room is warm." });
    const descriptionMatch = await createTicket({ subject: "Noise complaint", description: "Guest mentions air conditioning noise." });
    await createTicket({ subject: "Breakfast request", description: "Needs gluten-free bread." });

    const response = await request(app).get("/api/v1/tickets").query({ q: "conditioning" });

    expect(response.status).toBe(200);
    const ids = response.body.data.map((ticket: { id: string }) => ticket.id);
    expect(ids).toEqual(expect.arrayContaining([subjectMatch.id, descriptionMatch.id]));
    expect(ids).toHaveLength(2);
  });

  it("uses default pagination and supports custom pagination", async () => {
    for (let index = 0; index < 25; index += 1) {
      await createTicket({ subject: `Ticket ${index}` });
    }

    const defaultResponse = await request(app).get("/api/v1/tickets");
    expect(defaultResponse.status).toBe(200);
    expect(defaultResponse.body.data).toHaveLength(20);
    expect(defaultResponse.body.pagination).toMatchObject({ page: 1, page_size: 20, total: 25, total_pages: 2 });

    const customResponse = await request(app).get("/api/v1/tickets").query({ page: 2, page_size: 10 });
    expect(customResponse.status).toBe(200);
    expect(customResponse.body.data).toHaveLength(10);
    expect(customResponse.body.pagination).toMatchObject({ page: 2, page_size: 10, total: 25, total_pages: 3 });
  });

  it("rejects invalid filters and page_size above the maximum", async () => {
    const invalidStatus = await request(app).get("/api/v1/tickets").query({ status: "pending" });
    expect(invalidStatus.status).toBe(400);
    expectStandardError(invalidStatus.body, "VALIDATION_ERROR");

    const invalidPageSize = await request(app).get("/api/v1/tickets").query({ page_size: 101 });
    expect(invalidPageSize.status).toBe(400);
    expectStandardError(invalidPageSize.body, "VALIDATION_ERROR");
    expect(JSON.stringify(invalidPageSize.body)).toContain("page_size");
  });
});

describe("GET /api/v1/tickets/:id", () => {
  it("returns an existing non-deleted ticket", async () => {
    const ticket = await createTicket();

    const response = await request(app).get(`/api/v1/tickets/${ticket.id}`);

    expect(response.status).toBe(200);
    expectTicketShape(response.body);
    expect(response.body.id).toBe(ticket.id);
  });

  it.each(["not-an-object-id", missingObjectId()])("returns 404 for invalid or missing id %s", async (id) => {
    const response = await request(app).get(`/api/v1/tickets/${id}`);

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });

  it("returns 404 for a soft-deleted ticket id", async () => {
    const ticket = await createTicket();
    await request(app).delete(`/api/v1/tickets/${ticket.id}`).expect(204);

    const response = await request(app).get(`/api/v1/tickets/${ticket.id}`);

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });
});

describe("PATCH /api/v1/tickets/:id", () => {
  it("partially updates mutable fields and changes updated_at", async () => {
    const ticket = await createTicket();
    await wait(10);

    const response = await request(app).patch(`/api/v1/tickets/${ticket.id}`).send({
      subject: "Updated subject",
      status: "resolved",
      assigned_to: "agent-3"
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: ticket.id,
      subject: "Updated subject",
      status: "resolved",
      assigned_to: "agent-3"
    });
    expect(new Date(response.body.updated_at).getTime()).toBeGreaterThan(new Date(ticket.updated_at).getTime());
  });

  it.each([
    ["invalid enum value", { status: "pending" }],
    ["invalid field type", { assigned_to: 123 }],
    ["subject over 200 characters", { subject: "x".repeat(201) }],
    ["immutable id", { id: missingObjectId() }],
    ["immutable created_at", { created_at: new Date().toISOString() }],
    ["immutable updated_at", { updated_at: new Date().toISOString() }],
    ["immutable deleted_at", { deleted_at: new Date().toISOString() }]
  ])("rejects invalid update payload: %s", async (_case, patch) => {
    const ticket = await createTicket({ subject: "Original subject" });

    const response = await request(app).patch(`/api/v1/tickets/${ticket.id}`).send(patch);

    expect(response.status).toBe(400);
    expectStandardError(response.body, "VALIDATION_ERROR");
    const unchanged = await TicketModel.findById(ticket.id);
    expect(unchanged?.subject).toBe("Original subject");
  });

  it.each(["not-an-object-id", missingObjectId()])("returns 404 for invalid or missing id %s", async (id) => {
    const response = await request(app).patch(`/api/v1/tickets/${id}`).send({ subject: "Updated" });

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });

  it("returns 404 for a soft-deleted ticket id", async () => {
    const ticket = await createTicket();
    await request(app).delete(`/api/v1/tickets/${ticket.id}`).expect(204);

    const response = await request(app).patch(`/api/v1/tickets/${ticket.id}`).send({ subject: "Updated" });

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });
});

describe("DELETE /api/v1/tickets/:id", () => {
  it("returns 204 and sets deleted_at without hard deletion", async () => {
    const ticket = await createTicket();

    const response = await request(app).delete(`/api/v1/tickets/${ticket.id}`);

    expect(response.status).toBe(204);
    const persisted = await TicketModel.findById(ticket.id);
    expect(persisted).not.toBeNull();
    expect(persisted?.deleted_at).toBeInstanceOf(Date);
  });

  it("removes deleted tickets from retrieve and list responses", async () => {
    const ticket = await createTicket();
    await request(app).delete(`/api/v1/tickets/${ticket.id}`).expect(204);

    const retrieve = await request(app).get(`/api/v1/tickets/${ticket.id}`);
    expect(retrieve.status).toBe(404);

    const list = await request(app).get("/api/v1/tickets");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0);
  });

  it.each(["not-an-object-id", missingObjectId()])("returns 404 for invalid or missing id %s", async (id) => {
    const response = await request(app).delete(`/api/v1/tickets/${id}`);

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });

  it("returns 404 for an already-deleted ticket id", async () => {
    const ticket = await createTicket();
    await request(app).delete(`/api/v1/tickets/${ticket.id}`).expect(204);

    const response = await request(app).delete(`/api/v1/tickets/${ticket.id}`);

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });
});
