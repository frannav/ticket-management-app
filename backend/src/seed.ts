import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "./db.js";
import { TicketModel, type Ticket } from "./tickets/ticket.model.js";
import { ticketChannels, ticketPriorities, ticketStatuses } from "./tickets/ticket.types.js";

dotenv.config();

const mongodbUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/thinkin_tickets";

const guestIssues = [
  "Air conditioning calibration required",
  "Late checkout approval pending",
  "Spa booking confirmation missing",
  "Airport transfer delayed",
  "Invoice details need correction",
  "Room service order duplicated",
  "Pool access card not working",
  "Noise complaint from adjacent room",
  "Lost luggage follow-up needed",
  "Restaurant allergy note missing",
  "Housekeeping refresh requested",
  "Wi-Fi speed complaint",
  "Maintenance inspection for shower",
  "Minibar charge disputed",
  "Extra bed setup pending",
  "VIP welcome amenity delayed",
  "Parking gate access blocked",
  "Early breakfast box requested",
  "Conference room projector issue",
  "Pet policy clarification requested",
  "Wake-up call confirmation",
  "Laundry delivery late",
  "Accessible room equipment check",
  "Booking name mismatch",
  "Terrace door lock inspection",
  "Guest profile merge request",
  "Taxi receipt copy needed",
  "Baby cot setup pending",
  "Gym access code not received",
  "Refund timeline question",
  "Sofa bed linen missing",
  "Digital key activation failed",
  "Room move preference captured",
  "Welcome drink voucher missing",
  "Safe reset assistance requested",
  "Tour pickup location unclear",
  "Late-night dining options requested",
  "Heating panel troubleshooting",
  "Check-in document upload failed",
  "Celebration cake confirmation",
  "Beach towel deposit question",
  "Elevator outage guest update",
  "Reservation extension inquiry",
  "Pillow menu request",
  "Final bill pre-review"
] as const;

const agents = ["ana", "bruno", "carla", "diego", "elena", null] as const;
const hotels = ["hotel-atlantic", "hotel-volcan", "hotel-marina", "hotel-botanico", "hotel-dunas"] as const;

const sampleTickets = guestIssues.map((subject, index): Ticket => {
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

  const operations = sampleTickets.map((ticket) => ({
    updateOne: {
      filter: { hotel_id: ticket.hotel_id, subject: ticket.subject },
      update: { $setOnInsert: ticket },
      upsert: true
    }
  }));

  const result = await TicketModel.collection.bulkWrite(operations, { ordered: false });
  const totalDemoTickets = await TicketModel.countDocuments({ subject: /^\[Demo \d+\]/, deleted_at: null });

  console.log(
    JSON.stringify(
      {
        message: "Demo ticket seed completed",
        mongodbUri,
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
