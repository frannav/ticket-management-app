import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "./db.js";
import { TicketModel, type Ticket } from "./tickets/infra/ticket.model.js";
import { ticketChannels, ticketPriorities, ticketStatuses } from "./tickets/domain/ticket.types.js";

dotenv.config();

const mongodbUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/thinkin_tickets";

const guestIssues = [
  "AC issue",
  "Late checkout",
  "Spa booking",
  "Airport transfer",
  "Invoice fix",
  "Room service",
  "Pool card",
  "Noise complaint",
  "Lost luggage",
  "Allergy note",
  "Housekeeping",
  "Wi-Fi speed",
  "Shower check",
  "Minibar dispute",
  "Extra bed",
  "VIP amenity",
  "Parking access",
  "Breakfast box",
  "Projector issue",
  "Pet policy"
] as const;

const agents = ["ana", "bruno", "carla", "diego", "elena", null] as const;
const hotels = ["hotel-atlantic", "hotel-volcan", "hotel-marina", "hotel-botanico", "hotel-dunas"] as const;

const sampleTickets = guestIssues.slice(0, 20).map((subject, index): Ticket => {
  const channel = ticketChannels[index % ticketChannels.length]!;
  const status = ticketStatuses[index % ticketStatuses.length]!;
  const priority = ticketPriorities[(index * 2 + 1) % ticketPriorities.length]!;
  const assigned_to = agents[index % agents.length] ?? null;
  const hotel_id = hotels[index % hotels.length]!;

  return {
    hotel_id,
    subject: `[Demo ${String(index + 1).padStart(2, "0")}] ${subject}`,
    description: `Demo ticket ${index + 1} for pagination and filtering review. The guest-facing team can use this record to inspect board density, status badges, priorities, assignees, and the modal workflow.`,
    channel,
    status,
    priority,
    assigned_to,
    created_at: new Date(Date.now() - index * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - index * 45 * 60 * 1000),
    deleted_at: null
  };
});

const seedTickets = async () => {
  await connectDatabase(mongodbUri);

  const demoSubjects = sampleTickets.map((ticket) => ticket.subject);
  const demoRegex = /^\[Demo \d+\]/;
  const removedOutdated = await TicketModel.deleteMany({
    $and: [{ subject: demoRegex }, { subject: { $nin: demoSubjects } }]
  });

  const operations = sampleTickets.map((ticket) => ({
    updateOne: {
      filter: { hotel_id: ticket.hotel_id, subject: ticket.subject },
      update: { $setOnInsert: ticket },
      upsert: true
    }
  }));

  const result = await TicketModel.collection.bulkWrite(operations, { ordered: false });
  const totalDemoTickets = await TicketModel.countDocuments({ subject: demoRegex, deleted_at: null });

  console.log(
    JSON.stringify(
      {
        message: "Demo ticket seed completed",
        mongodbUri,
        removedOutdated: removedOutdated.deletedCount,
        inserted: result.upsertedCount,
        matchedExisting: result.matchedCount,
        totalDemoTickets
      },
      null,
      2
    )
  );
};

try {
  await seedTickets();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
