import express from "express";
import morgan from "morgan";
import { z } from "zod";
import { errorHandler, notFoundHandler, validateBody } from "./middleware/errors.js";
import { ticketRouter } from "./tickets/ticket.routes.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(morgan("tiny"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV === "test") {
    app.post(
      "/__test/validation",
      validateBody(z.object({ name: z.string().min(1) }).strict()),
      (_req, res) => res.status(204).send()
    );
    app.get("/__test/not-found", (_req, _res, next) => next(notFoundHandler("Test resource not found")));
    app.get("/__test/unexpected", () => {
      throw new Error("Sensitive internal failure");
    });
  }

  app.use("/api/v1/tickets", ticketRouter);

  app.use((_req, _res, next) => next(notFoundHandler("Route not found")));
  app.use(errorHandler);

  return app;
};
