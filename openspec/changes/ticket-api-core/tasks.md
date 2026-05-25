## 1. Backend scaffold and local infrastructure

- [x] 1.1 Create `/backend` Node.js + TypeScript project structure with package scripts for development, build, test, and start.
- [x] 1.2 Add backend dependencies for Express, Mongoose, Zod, minimal logging, TypeScript execution, Vitest, and Supertest.
- [x] 1.3 Add backend TypeScript, lint/build, and test configuration without implementing ticket behavior yet.
- [x] 1.4 Add Docker Compose with MongoDB service, local MongoDB environment variables, and named volume.
- [x] 1.5 Add backend Dockerfile and optional backend service in Docker Compose for local development.
- [x] 1.6 Create app/server/database/config skeletons so tests can import the Express app and connect to a configured MongoDB database.

## 2. Test harness and shared API behavior

- [x] 2.1 Add integration test setup that connects to an isolated MongoDB test database.
- [x] 2.2 Add test hooks that clean ticket data between tests and close database connections after the suite.
- [x] 2.3 Add failing tests for standard validation, not-found, and unexpected error response shapes.
- [x] 2.4 Implement the minimum shared validation/error middleware needed to make the error response tests pass.
- [x] 2.5 Refactor shared test helpers for creating requests and asserting standard error responses while keeping tests green.

## 3. Create ticket endpoint - red, green, refactor

- [x] 3.1 RED: Add a failing endpoint test for `POST /api/v1/tickets` creating a valid ticket with generated `id`, timestamps, default `status=open`, default `assigned_to=null`, and `deleted_at=null`.
- [x] 3.2 RED: Add failing endpoint tests for invalid create payloads, including missing required fields, invalid enum values, and `subject` over 200 characters.
- [x] 3.3 GREEN: Add the ticket model, create request schema, and `POST /api/v1/tickets` route with the minimum code needed for the create tests to pass.
- [x] 3.4 REFACTOR: Extract response serialization so Mongo `_id` is exposed as API `id` and internal fields are hidden.

## 4. List tickets endpoint - red, green, refactor

- [x] 4.1 RED: Add a failing endpoint test for `GET /api/v1/tickets` returning non-deleted tickets with `{ data, pagination }`.
- [x] 4.2 RED: Add failing endpoint tests for filters by `hotel_id`, `status`, `priority`, `channel`, and `assigned_to`.
- [x] 4.3 RED: Add a failing endpoint test for `q` text search across `subject` and `description`.
- [x] 4.4 RED: Add failing endpoint tests for default pagination, custom pagination, and rejecting `page_size` above the maximum.
- [x] 4.5 GREEN: Implement list query validation, Mongo query construction, text search, pagination metadata, and exclusion of soft-deleted tickets.
- [x] 4.6 REFACTOR: Add helpful Mongo indexes and simplify list-query helpers while keeping all list tests green.

## 5. Retrieve ticket endpoint - red, green, refactor

- [x] 5.1 RED: Add a failing endpoint test for `GET /api/v1/tickets/:id` returning an existing non-deleted ticket.
- [x] 5.2 RED: Add failing endpoint tests for invalid, missing, and soft-deleted ticket ids returning `404`.
- [x] 5.3 GREEN: Implement the retrieve route with non-deleted lookup and standard not-found behavior.
- [x] 5.4 REFACTOR: Reuse common id validation and ticket lookup utilities while keeping retrieve tests green.

## 6. Update ticket endpoint - red, green, refactor

- [x] 6.1 RED: Add a failing endpoint test for `PATCH /api/v1/tickets/:id` partially updating mutable fields and changing `updated_at`.
- [x] 6.2 RED: Add failing endpoint tests rejecting invalid enum values, invalid field types, `subject` over 200 characters, and immutable fields.
- [x] 6.3 RED: Add failing endpoint tests for invalid, missing, and soft-deleted ticket ids returning `404`.
- [x] 6.4 GREEN: Implement update schema and route with the minimum code needed to update only mutable fields on non-deleted tickets.
- [x] 6.5 REFACTOR: Consolidate create/update schema definitions and shared ticket serialization while keeping update tests green.

## 7. Soft delete endpoint - red, green, refactor

- [x] 7.1 RED: Add a failing endpoint test for `DELETE /api/v1/tickets/:id` returning `204` and setting `deleted_at`.
- [x] 7.2 RED: Add failing endpoint tests proving deleted tickets no longer appear in retrieve and list responses.
- [x] 7.3 RED: Add failing endpoint tests for invalid, missing, and already-deleted ticket ids returning `404`.
- [x] 7.4 GREEN: Implement soft delete by setting `deleted_at` on non-deleted tickets without hard deletion.
- [x] 7.5 REFACTOR: Ensure all ticket reads consistently exclude soft-deleted records and keep the full test suite green.

## 8. Final verification and documentation

- [x] 8.1 Run the complete backend test suite against the isolated test database and confirm it passes.
- [x] 8.2 Run the backend build/typecheck and fix any TypeScript errors.
- [x] 8.3 Verify Docker Compose starts MongoDB and the backend can connect using documented local environment variables.
- [x] 8.4 Document backend startup, test commands, Docker usage, environment variables, and production follow-ups.
- [x] 8.5 Perform a final refactor pass for naming, small modules, and readability without changing behavior.
