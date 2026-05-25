## Context

This repository currently contains the technical-test requirements and OpenSpec metadata, but no application code. The first implementation slice is the backend API for the simplified hotel contact-center ticket system. The backend must be small enough for a 3–4 hour technical test while still demonstrating senior-level fundamentals: clear API boundaries, MongoDB persistence, validation, consistent errors, Docker-based local setup, and behavior-driven tests written before implementation.

## Goals / Non-Goals

**Goals:**

- Build a focused `/backend` service with Node.js, TypeScript, and MongoDB.
- Provide Docker Compose from the start so local MongoDB is reproducible.
- Implement ticket CRUD-style REST behavior with filtering, pagination, soft delete, validation, logging, and consistent errors.
- Drive each main endpoint through failing integration tests first, then minimal implementation, then refactor.
- Keep the architecture understandable for a live technical-test defense.

**Non-Goals:**

- No frontend work in this change.
- No authentication, authorization, multi-tenant security enforcement, or user management.
- No production-grade observability, distributed tracing, Kubernetes, or cloud deployment.
- No over-engineered layered architecture beyond what helps readability and testability.

## Decisions

### Use Express, TypeScript, Zod, Mongoose, Vitest, and Supertest

- **Decision:** Implement the backend with Express for HTTP routing, TypeScript for types, Zod for request validation, Mongoose for MongoDB modeling/querying, Vitest as the test runner, and Supertest for endpoint tests.
- **Rationale:** This stack is familiar, quick to scaffold, easy to defend, and keeps endpoint behavior tests straightforward. Mongoose provides useful schema defaults, timestamps, indexes, and ObjectId handling without requiring a custom repository layer for a small test.
- **Alternatives considered:** Fastify would provide better built-in schema ergonomics and performance, but Express + Supertest is simpler for the exercise. The native MongoDB driver would reduce abstraction, but would require more manual validation and mapping.

### Keep a thin modular backend structure

- **Decision:** Use a small structure such as `src/app.ts`, `src/server.ts`, `src/config.ts`, `src/db.ts`, `src/tickets/ticket.model.ts`, `src/tickets/ticket.routes.ts`, `src/tickets/ticket.schemas.ts`, and shared middleware for errors/logging.
- **Rationale:** Separating app construction from server startup makes integration tests easy, while grouping ticket code keeps the implementation navigable.
- **Alternatives considered:** A full clean architecture with controllers, services, repositories, and dependency injection is unnecessary for the required scope and timebox.

### Map Mongo `_id` to API `id`

- **Decision:** Store tickets as MongoDB documents but expose `id` in API responses. Do not expose `_id` or `__v`.
- **Rationale:** The requirements call for an `id` field, and keeping the response shape persistence-agnostic improves frontend ergonomics.
- **Alternatives considered:** Generating UUIDs is valid, but ObjectIds are sufficient for this exercise and reduce schema complexity.

### Use soft delete by `deleted_at`

- **Decision:** `DELETE /api/v1/tickets/:id` sets `deleted_at` instead of removing the document. Normal list, retrieve, and update operations exclude soft-deleted tickets.
- **Rationale:** This matches the requested model and demonstrates safe destructive operations.
- **Alternatives considered:** Hard deletes are simpler but do not satisfy the model. A separate audit/event store is out of scope.

### Define explicit API defaults

- **Decision:** Use `status=open` and `assigned_to=null` defaults on creation when omitted; require `hotel_id`, `subject`, `description`, `channel`, and `priority`.
- **Rationale:** New tickets naturally start open and may be unassigned, while the other fields are core ticket metadata.
- **Alternatives considered:** Requiring every field on creation is stricter but less ergonomic. Defaulting priority could hide important business intent, so priority remains required.

### Standardize list pagination and shape

- **Decision:** `GET /api/v1/tickets` returns `{ data, pagination }`, defaults to `page=1` and `page_size=20`, and caps `page_size` at `100`.
- **Rationale:** This gives predictable frontend consumption and protects the API from accidental large scans.
- **Alternatives considered:** Offset-only responses or cursor pagination are unnecessary at this scale and timebox.

### Integration tests use an isolated test database

- **Decision:** Test configuration points to a dedicated MongoDB test database, and test hooks clean ticket data between tests.
- **Rationale:** Endpoint tests should exercise real persistence behavior without contaminating local development data.
- **Alternatives considered:** In-memory MongoDB can be convenient, but the requirement explicitly calls for clear database integration setup and MongoDB through Docker Compose from the start.

## Risks / Trade-offs

- **Docker-dependent integration tests** → Document that MongoDB must be running through Docker Compose before tests, and keep test database names isolated.
- **Mongoose abstraction hides raw Mongo details** → Keep schemas and queries simple, and expose only API DTOs.
- **Text search can become slow at scale** → Add an index for `subject` and `description`; reserve advanced search tuning for future production hardening.
- **Validation duplication between Zod and Mongoose** → Treat Zod as the API boundary source of truth and keep Mongoose schema constraints aligned.
- **Timebox pressure may encourage coding before tests** → Make tasks explicitly require a failing endpoint test before each implementation step.
