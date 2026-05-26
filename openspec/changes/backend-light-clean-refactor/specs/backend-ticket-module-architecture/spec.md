## ADDED Requirements

### Requirement: Ticket feature module boundaries
The backend ticket feature SHALL be organized into feature-local `domain`, `use-cases`, and `infra` areas while preserving simple route, controller, and schema files at the ticket feature root.

#### Scenario: Target ticket feature structure exists
- **WHEN** the backend ticket feature is inspected after the refactor
- **THEN** `/backend/src/tickets/domain` exists for ticket domain definitions
- **AND** `/backend/src/tickets/use-cases` exists for ticket application flows
- **AND** `/backend/src/tickets/infra` exists for MongoDB persistence details
- **AND** `/backend/src/tickets/ticket.routes.ts`, `/backend/src/tickets/ticket.controller.ts`, and `/backend/src/tickets/ticket.schemas.ts` exist at the ticket feature root

#### Scenario: No large architectural framework is introduced
- **WHEN** the refactored backend dependencies and ticket module files are reviewed
- **THEN** the ticket feature does not introduce a dependency injection container
- **AND** the ticket feature does not introduce CQRS, event buses, mediator layers, or unrelated enterprise patterns

### Requirement: Domain remains framework and persistence agnostic
The ticket domain area SHALL contain ticket types, enums, and ticket-related domain definitions without depending on HTTP or MongoDB-specific libraries.

#### Scenario: Domain has no HTTP or MongoDB imports
- **WHEN** files under `/backend/src/tickets/domain` are reviewed
- **THEN** they do not import Express request or response types
- **AND** they do not import Mongoose, MongoDB, or MongoDB ObjectId helpers
- **AND** they do not define database schemas, indexes, or persistence queries

#### Scenario: Domain definitions remain reusable
- **WHEN** ticket enums and ticket response or entity types are needed by controllers, use cases, or infra
- **THEN** those shared ticket definitions are imported from the domain area rather than redefined independently

### Requirement: Use cases are HTTP independent
The ticket use-case area SHALL provide create, list, get-by-id, update, and soft-delete flows that can be invoked without Express request or response objects.

#### Scenario: Required ticket use cases exist
- **WHEN** files under `/backend/src/tickets/use-cases` are inspected
- **THEN** there is a use case for creating a ticket
- **AND** there is a use case for listing tickets
- **AND** there is a use case for getting a ticket by id
- **AND** there is a use case for updating a ticket
- **AND** there is a use case for soft-deleting a ticket

#### Scenario: Use cases avoid HTTP coupling
- **WHEN** ticket use-case files are reviewed
- **THEN** they do not import Express request or response types
- **AND** they accept plain input values or typed input objects
- **AND** they return plain results or throw/use explicit application errors that controllers can map to HTTP responses

### Requirement: Infra owns MongoDB persistence details
The ticket infra area SHALL own the MongoDB model/schema, repository implementation, MongoDB-specific filters, and persistence query details.

#### Scenario: MongoDB model and repository are isolated in infra
- **WHEN** the ticket persistence implementation is inspected
- **THEN** the Mongoose model/schema lives under `/backend/src/tickets/infra`
- **AND** MongoDB-specific query construction for listing, filtering, pagination, summary metrics, id lookup, update, and soft delete lives under `/backend/src/tickets/infra`
- **AND** MongoDB schema indexes and persistence defaults live under `/backend/src/tickets/infra`

#### Scenario: Soft-delete reads remain centralized
- **WHEN** ticket retrieve, list, update, or delete behavior queries persisted tickets
- **THEN** the persistence layer consistently excludes tickets whose `deleted_at` is not `null` except when setting `deleted_at` during soft delete

### Requirement: HTTP adapter preserves the existing REST contract
The ticket routes, controller, and schemas SHALL preserve the existing ticket API contract while delegating business flows to use cases.

#### Scenario: Routes preserve endpoint URLs
- **WHEN** ticket routes are registered after the refactor
- **THEN** the API continues to expose the existing `/api/v1/tickets` endpoints for create, list, retrieve, update, and soft delete
- **AND** no endpoint URL is renamed, removed, or added by this refactor

#### Scenario: Request and response formats are unchanged
- **WHEN** existing backend integration tests exercise ticket create, list, retrieve, update, and soft delete behavior
- **THEN** request payload formats remain accepted as before
- **AND** response payload formats remain the same as before
- **AND** validation error and not-found response formats remain the same as before
- **AND** list pagination, filters, text search, summary metrics, and soft-delete visibility remain the same as before

#### Scenario: Controllers map HTTP to use cases
- **WHEN** `ticket.controller.ts` is reviewed
- **THEN** it maps validated route input to use-case input
- **AND** it maps use-case output to the existing HTTP response shape
- **AND** it maps known use-case errors to existing HTTP error behavior

### Requirement: Refactor proceeds with regression-safe verification
The backend refactor SHALL be performed in small steps with existing tests used as the main regression signal.

#### Scenario: Baseline is verified before refactor
- **WHEN** implementation of this change begins
- **THEN** the existing backend test suite is run before moving code
- **AND** the baseline result is recorded in implementation notes or task progress

#### Scenario: Tests are run after relevant code movement
- **WHEN** domain definitions, infra persistence, use cases, or controllers are moved or extracted
- **THEN** the backend test suite or the relevant focused backend tests are run before proceeding to the next major movement

#### Scenario: Bugs discovered during refactor are fixed test-first
- **WHEN** the refactor uncovers missing behavior or a pre-existing bug
- **THEN** a failing test is added first to capture the expected behavior
- **AND** the fix preserves the existing public API contract unless the bug fix explicitly requires a documented correction
