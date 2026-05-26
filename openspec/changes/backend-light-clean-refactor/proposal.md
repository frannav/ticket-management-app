## Why

The backend ticket API already satisfies the required behavior, but the ticket feature is concentrated in a small module that mixes domain definitions, persistence details, and HTTP concerns. A light refactor will make the implementation easier to read, test, and defend in a senior full-stack technical interview without changing the REST contract or introducing heavy architecture.

## What Changes

- Reorganize the backend ticket feature into pragmatic `domain`, `use-cases`, and `infra` areas under `/backend/src/tickets`.
- Keep `ticket.routes.ts`, `ticket.controller.ts`, and `ticket.schemas.ts` close to the ticket feature for simple HTTP routing, validation, and request/response mapping.
- Move ticket types, enums, and domain definitions into `domain` with no Express or MongoDB/Mongoose imports.
- Move create, list, get-by-id, update, and soft-delete business flows into `use-cases` that do not depend on HTTP request/response objects.
- Move the MongoDB model/schema, ticket repository, and MongoDB-specific query logic into `infra`.
- Preserve all existing endpoint URLs, request formats, response formats, validation behavior, and tests.
- Avoid large rewrites, dependency injection containers, CQRS, event buses, authentication, authorization, new product features, or frontend changes.

## Capabilities

### New Capabilities

- `backend-ticket-module-architecture`: Defines the lightweight ticket backend module boundaries, dependency direction, and refactor safety requirements.

### Modified Capabilities

- None.

## Impact

- Affects backend ticket source organization under `/backend/src/tickets`.
- Does not change the public `/api/v1/tickets` REST API contract.
- Does not introduce new runtime dependencies or database schema redesign.
- Existing backend tests remain the primary regression safety net and must stay green throughout the refactor.
