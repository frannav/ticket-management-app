import request from "supertest";
import { expect } from "vitest";
import { createApp } from "../src/app.js";
import type { ErrorCode } from "../src/middleware/errors.js";

export const app = createApp();

export const validTicketPayload = (overrides: Record<string, unknown> = {}) => ({
  hotel_id: "hotel-1",
  subject: "Guest needs extra towels",
  description: "Room 201 requested extra towels by phone.",
  channel: "phone",
  priority: "medium",
  ...overrides
});

export const createTicket = async (overrides: Record<string, unknown> = {}) => {
  const response = await request(app).post("/api/v1/tickets").send(validTicketPayload(overrides));
  expect(response.status).toBe(201);
  return response.body;
};

export const expectStandardError = (body: unknown, code: ErrorCode) => {
  expect(body).toEqual(
    expect.objectContaining({
      error: expect.objectContaining({
        code,
        message: expect.any(String)
      })
    })
  );
};

export const expectTicketShape = (ticket: Record<string, unknown>) => {
  expect(ticket).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      hotel_id: expect.any(String),
      subject: expect.any(String),
      description: expect.any(String),
      channel: expect.stringMatching(/^(phone|email|chat|social)$/),
      status: expect.stringMatching(/^(open|in_progress|resolved|closed)$/),
      priority: expect.stringMatching(/^(low|medium|high|urgent)$/),
      created_at: expect.any(String),
      updated_at: expect.any(String),
      deleted_at: null
    })
  );
  expect(ticket.assigned_to === null || typeof ticket.assigned_to === "string").toBe(true);
  expect(ticket).not.toHaveProperty("_id");
  expect(ticket).not.toHaveProperty("__v");
};
