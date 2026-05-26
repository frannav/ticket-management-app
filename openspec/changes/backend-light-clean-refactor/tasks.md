## 1. Baseline and refactor guardrails

- [x] 1.1 Inspect the current ticket API implementation and note the existing route handlers, model/schema, validation schemas, serializer, list query logic, summary metrics, and tests that must remain behaviorally unchanged.
- [x] 1.2 Run the existing backend test suite before moving code and record that the baseline is green.
- [x] 1.3 Confirm the refactor scope: no endpoint URL changes, no request/response format changes, no auth, no new product features, no database redesign, and no dependency injection container.
- [x] 1.4 If a missing behavior or pre-existing bug is discovered during refactor work, add a failing backend test that captures the expected behavior before fixing it.

Implementation notes:

- Baseline inspection found `ticket.routes.ts` owning create/list/get/update/delete handlers, active-ticket lookup, ObjectId validation, list filter/search construction, summary metric counts, and persistence calls; `ticket.model.ts` owns the Mongoose schema/indexes; `ticket.schemas.ts` owns Zod HTTP validation; `ticket.serializer.ts` owns the public response shape; `backend/test/tickets.test.ts` covers contract behavior that must remain unchanged.
- Baseline verification: `rtk npm test` passed with 36/36 tests after running outside the sandbox so Vitest could connect to the local MongoDB Docker service.
- Scope confirmed as refactor-only: no endpoint URL changes, no request/response format changes, no auth, no new product features, no database redesign, and no dependency injection container.
- No missing behavior or pre-existing bug was discovered during baseline inspection.
- Final verification: `rtk npm run typecheck`, `rtk npm run build`, `rtk npm run lint`, and final `rtk npm test` all passed; final test result was 36/36 tests passing.
- Pragmatic compromise retained intentionally: use cases are small functions wired directly to the feature-local MongoDB repository rather than using a dependency injection container; they return repository documents so the existing shared serializer can preserve the public REST response shape without duplicating mapping logic.

## 2. Domain extraction

- [x] 2.1 Create `/backend/src/tickets/domain` for ticket enums, ticket types, and ticket-related domain definitions.
- [x] 2.2 Move the existing ticket enum arrays, enum-derived types, and API/domain ticket response definitions into the domain area without importing Express, Mongoose, MongoDB, or Zod.
- [x] 2.3 Update existing imports to read shared ticket definitions from the domain area.
- [x] 2.4 Run the relevant backend tests after the domain move and fix only refactor-related import or type issues.

## 3. Infra extraction

- [x] 3.1 Create `/backend/src/tickets/infra` for MongoDB persistence implementation details.
- [x] 3.2 Move the Mongoose ticket model/schema, indexes, persistence defaults, and hydrated document typing into the infra area.
- [x] 3.3 Extract MongoDB-specific repository functions for creating tickets, listing tickets with filters/pagination/summary metrics, finding active tickets by id, updating active tickets, and soft-deleting active tickets.
- [x] 3.4 Move MongoDB-specific helpers such as ObjectId validation, active-ticket filters, regex escaping for text search, query construction, sort, skip/limit, and count logic into infra.
- [x] 3.5 Update temporary callers to use the infra repository while preserving current API behavior.
- [x] 3.6 Run the relevant backend tests after the infra move, with special attention to list filters, text search, summary metrics, pagination, and soft-delete visibility.

## 4. Use-case extraction

- [x] 4.1 Create `/backend/src/tickets/use-cases` for ticket application flows.
- [x] 4.2 Add a create-ticket use case that accepts plain validated input and delegates persistence to the ticket repository.
- [x] 4.3 Add a list-tickets use case that accepts plain validated query input and returns tickets, pagination data, and summary metrics without depending on Express objects.
- [x] 4.4 Add a get-ticket-by-id use case that returns an active ticket or an explicit not-found result/error without importing HTTP framework types.
- [x] 4.5 Add an update-ticket use case that updates mutable fields for active tickets and preserves existing not-found behavior.
- [x] 4.6 Add a soft-delete-ticket use case that sets `deleted_at` for active tickets and preserves existing `204`/not-found behavior.
- [x] 4.7 Run the relevant backend tests after use-case extraction and fix only behavior-preserving refactor issues.

## 5. Controller and route simplification

- [x] 5.1 Create `/backend/src/tickets/ticket.controller.ts` as the HTTP adapter for ticket create, list, retrieve, update, and soft delete handlers.
- [x] 5.2 Move request-to-use-case input mapping, use-case output-to-response mapping, and known not-found error mapping into the controller.
- [x] 5.3 Keep `/backend/src/tickets/ticket.schemas.ts` as the Zod HTTP validation boundary for create, update, and list query parsing.
- [x] 5.4 Simplify `/backend/src/tickets/ticket.routes.ts` so it registers routes, validation middleware, and controller handlers without owning business or MongoDB query logic.
- [x] 5.5 Preserve the existing ticket response serialization shape, including `id`, ISO timestamps, nullable `assigned_to`, nullable `deleted_at`, pagination, and list `summary`.
- [x] 5.6 Run the full backend test suite after controller/route simplification.

## 6. Final verification and cleanup

- [x] 6.1 Review the final `/backend/src/tickets` structure against the target `domain`, `use-cases`, `infra`, `ticket.routes.ts`, `ticket.controller.ts`, and `ticket.schemas.ts` layout.
- [x] 6.2 Remove obsolete ticket files or duplicate helpers that are no longer needed after the refactor.
- [x] 6.3 Run backend typecheck and build verification.
- [x] 6.4 Run backend lint verification if the project lint script is available.
- [x] 6.5 Run the complete backend test suite one final time and confirm all existing tests remain green.
- [x] 6.6 Document any intentionally retained pragmatic compromise in implementation notes or the final summary so the refactor remains easy to defend in an interview.
