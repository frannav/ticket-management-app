import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, expectStandardError } from "./helpers.js";

describe("standard error responses", () => {
  it("returns a stable validation error shape", async () => {
    const response = await request(app).post("/__test/validation").send({});

    expect(response.status).toBe(400);
    expectStandardError(response.body, "VALIDATION_ERROR");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "name",
          message: expect.any(String)
        })
      ])
    );
  });

  it("returns a stable not-found error shape", async () => {
    const response = await request(app).get("/__test/not-found");

    expect(response.status).toBe(404);
    expectStandardError(response.body, "NOT_FOUND");
  });

  it("hides internal details for unexpected errors", async () => {
    const response = await request(app).get("/__test/unexpected");

    expect(response.status).toBe(500);
    expectStandardError(response.body, "INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.toContain("Sensitive internal failure");
    expect(JSON.stringify(response.body)).not.toContain("stack");
  });
});
