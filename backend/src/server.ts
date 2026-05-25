import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { connectDatabase } from "./db.js";

const start = async () => {
  const config = getConfig();
  await connectDatabase(config.mongodbUri);

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Ticket API listening on port ${config.port}`);
  });
};

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(`Failed to start Ticket API: ${message}`);
  process.exit(1);
});
