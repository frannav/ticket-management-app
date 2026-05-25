## Why

The technical test needs a focused backend API for managing contact-center tickets for hotels, matching the required Node.js, TypeScript, MongoDB, Docker, and test-driven development expectations. Establishing this API first creates the contract that the future frontend can consume while keeping the scope achievable within a 3–4 hour exercise.

## What Changes

- Add a Node.js + TypeScript backend API for ticket management under `/api/v1/tickets`.
- Persist tickets in MongoDB, with MongoDB available from the start through Docker Compose.
- Add Docker support for the backend and local development environment variables.
- Define the ticket lifecycle fields, enum constraints, timestamps, and `deleted_at` soft-delete behavior.
- Add REST endpoints to create, list, retrieve, partially update, and soft-delete tickets.
- Support listing filters for `hotel_id`, `status`, `priority`, `channel`, `assigned_to`, and `q` text search over `subject` and `description`.
- Add paginated listing with a reasonable maximum `page_size`.
- Add input validation, consistent error responses, and minimal request/error logging.
- Establish a TDD-oriented backend workflow with behavior-driven endpoint integration tests and isolated test database cleanup.

## Capabilities

### New Capabilities

- `ticket-api`: Defines the REST API behavior for ticket creation, retrieval, filtering, pagination, update, and soft deletion.
- `backend-runtime`: Defines backend runtime, persistence, Docker, configuration, validation, error handling, logging, and integration-test setup requirements.

### Modified Capabilities

- None.

## Impact

- New `/backend` service using Node.js + TypeScript and MongoDB.
- New Dockerfile for the backend and Docker Compose setup for MongoDB, with an optional backend service for local development.
- New backend endpoint test suite covering create, list/filter, retrieve-by-id, update, and soft delete behavior.
- Future frontend work will consume the `/api/v1/tickets` contract produced by this change.
