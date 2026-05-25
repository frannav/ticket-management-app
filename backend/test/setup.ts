import { afterAll, beforeAll, beforeEach } from "vitest";
import { connectDatabase, disconnectDatabase } from "../src/db.js";
import { TicketModel } from "../src/tickets/ticket.model.js";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI ?? "mongodb://localhost:27017/thinkin_tickets_test";

beforeAll(async () => {
  await connectDatabase(process.env.MONGODB_URI as string);
});

beforeEach(async () => {
  await TicketModel.deleteMany({});
});

afterAll(async () => {
  await TicketModel.deleteMany({});
  await disconnectDatabase();
});
