## Context

The backend ticket API was implemented first to satisfy the technical-test behavior: Express routes, Zod validation, Mongoose persistence, REST endpoints, pagination, filtering, summary metrics, soft delete, and integration tests. The current ticket feature is small and working, but route handlers still own too many concerns: HTTP handling, MongoDB queries, id checks, list filter construction, persistence calls, and response serialization are close together.

This change is intentionally a refactor, not a product feature. It should improve readability, maintainability, and testability while preserving the existing `/api/v1/tickets` API contract and existing tests. The target audience is both the reviewer of the technical test and the future maintainer who needs to understand where ticket domain definitions, business flows, and MongoDB-specific details live.

## Goals / Non-Goals

**Goals:**

- Split the ticket feature into three main internal areas: `domain`, `use-cases`, and `infra`.
- Keep HTTP routing, controllers, and Zod schemas simple and close to `/backend/src/tickets`.
- Preserve all endpoint URLs, request payloads, response payloads, status codes, error shapes, list filters, pagination behavior, summary metrics, and soft-delete behavior.
- Make use cases callable without Express `Request` or `Response` objects.
- Keep MongoDB/Mongoose-specific code out of domain definitions and use case orchestration where practical.
- Run the existing backend test suite before the refactor and after each relevant movement of code.
- Keep the design small enough to defend as a pragmatic technical-test refactor.

**Non-Goals:**

- No frontend changes.
- No full Clean Architecture rewrite or framework-purity exercise.
- No dependency injection container.
- No CQRS, event bus, domain events, mediator pattern, or enterprise layering.
- No authentication, authorization, tenancy enforcement, or new product features.
- No database redesign, migration, or response contract changes unless a pre-existing bug is discovered and covered by a failing test first.
- No new runtime dependency unless implementation discovers a compelling need; the expected path needs none.

## Decisions

### Use a pragmatic feature-local module layout

- **Decision:** Organize ticket code under `/backend/src/tickets` using `domain`, `use-cases`, and `infra`, while keeping `ticket.routes.ts`, `ticket.controller.ts`, and `ticket.schemas.ts` at the feature root.
- **Rationale:** This gives clear boundaries without hiding simple HTTP concerns behind too many folders. A reviewer can quickly see the route entry point, controller mapping, use case behavior, domain definitions, and persistence implementation.
- **Alternatives considered:** A full application-wide clean architecture layout would be more theoretical but too large for this technical test. Keeping all code flat is fastest but leaves the route module harder to test and explain.

Expected shape:

```text
backend/src/tickets/
  domain/
    ticket.types.ts
  use-cases/
    create-ticket.ts
    list-tickets.ts
    get-ticket-by-id.ts
    update-ticket.ts
    soft-delete-ticket.ts
  infra/
    ticket.model.ts
    ticket.repository.ts
  ticket.controller.ts
  ticket.routes.ts
  ticket.schemas.ts
```

Small supporting files such as an `index.ts`, mapper, or repository type file are acceptable if they reduce duplication, but the implementation should avoid creating a deep framework.

### Preserve controller simplicity

- **Decision:** Introduce `ticket.controller.ts` as the HTTP adapter that reads validated input, invokes use cases, serializes successful output, and maps known use case errors to HTTP responses.
- **Rationale:** The current routes already work, so controllers should be thin. They should not become a service layer; they only translate between Express and the use cases.
- **Alternatives considered:** Keeping route handlers inline would avoid one file but would continue mixing HTTP concerns with use case orchestration. Creating class-based controllers would add ceremony without benefit.

### Keep use cases as small functions

- **Decision:** Implement each use case as a small function for one ticket flow: create, list, get by id, update, and soft delete.
- **Rationale:** Function-based use cases are easy to test, import, and defend. They avoid unnecessary classes while still making business operations explicit.
- **Alternatives considered:** A single `TicketService` class would be familiar but tends to collect unrelated responsibilities. A command/query split is unnecessary for this scope.

### Depend on a lightweight repository abstraction, not a DI container

- **Decision:** Use cases may depend on a small repository contract or repository object, with the MongoDB implementation living in `infra`. Wiring can be direct and feature-local; no dependency injection container is introduced.
- **Rationale:** This separates MongoDB query details from use case orchestration while avoiding container setup, decorators, or framework-level configuration.
- **Alternatives considered:** Use cases importing Mongoose models directly would be simpler but would not meet the intended infra boundary. A full IoC setup would be over-engineered.

### Keep domain definitions persistence-agnostic

- **Decision:** Move ticket enums, API-facing ticket types, and domain input/output definitions into `domain`; domain files must not import Express, Mongoose, MongoDB, or Zod.
- **Rationale:** The domain layer should describe ticket concepts, not persistence or HTTP mechanics. This improves readability and reduces accidental coupling.
- **Alternatives considered:** Leaving enums beside Zod schemas is convenient but makes domain concepts feel like validation details.

### Keep Zod schemas at the HTTP boundary

- **Decision:** Leave request validation schemas in `ticket.schemas.ts`, close to routes/controllers.
- **Rationale:** Zod schemas validate HTTP input and query strings. Keeping them near the adapter layer makes it clear that parsing/coercion is an API boundary concern.
- **Alternatives considered:** Moving schemas into domain would blur domain and transport validation. Duplicating schemas per use case would increase maintenance cost.

### Preserve existing integration tests and add focused tests only for discovered bugs

- **Decision:** The current backend endpoint tests remain the primary regression suite. Use case or repository unit tests are optional and should only be added if they make the refactor safer or document behavior that is hard to cover through endpoint tests.
- **Rationale:** This is primarily a refactor. The safest signal is that the public API still behaves exactly as before.
- **Alternatives considered:** Rewriting tests around the new architecture would create churn and risk testing implementation details.

## Risks / Trade-offs

- **Accidental API contract drift** → Run the backend tests before refactoring and after each relevant code movement; compare response shapes carefully when moving serialization.
- **Too many files for a small backend** → Keep files focused on the requested boundaries only and avoid generic abstractions not needed by the ticket feature.
- **Repository abstraction becomes leaky** → Let the repository own ObjectId validation, active-ticket filters, list filters, sort, pagination, counts, and MongoDB update options; expose simple use case-facing methods.
- **Use cases duplicate validation already handled by Zod** → Treat Zod as the HTTP input validation layer and keep use cases responsible for orchestration and not-found behavior, not full schema validation.
- **Soft-delete and summary metric behavior regresses during query movement** → Move list query construction and metric counts together into infra and verify with existing list/soft-delete tests.
- **Import path churn causes TypeScript or ESM issues** → Move one group at a time and run typecheck/tests after each step.

## Migration Plan

1. Confirm the current backend test suite is green before moving code.
2. Move domain definitions first and update imports while keeping tests green.
3. Extract MongoDB model/query logic into `infra` and keep route behavior temporarily intact.
4. Extract use case functions around the infra repository.
5. Introduce `ticket.controller.ts` and simplify `ticket.routes.ts` to route registration and middleware composition.
6. Run the full backend test, typecheck, build, and lint verification.

Rollback is straightforward because this is an internal refactor: revert the change if tests fail in a way that cannot be fixed without expanding scope.

## Open Questions

- None currently. If implementation discovers a behavioral bug, document it, add a failing test, and fix it without broadening the architecture.
