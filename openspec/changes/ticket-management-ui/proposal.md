## Why

The technical test now has a working ticket backend API, but it still needs a pragmatic Vue frontend that demonstrates how a Senior Full-Stack Engineer consumes and validates that contract from a user-facing application. This change adds the simplified contact-center ticket management UI while preserving the exercise's 3–4 hour scope and enforcing a TDD-oriented frontend workflow.

## What Changes

- Add a Vue 3 + TypeScript frontend for managing tickets.
- Use Vuetify for the UI component library and basic responsive layout.
- Integrate with the existing backend endpoints:
  - `GET /api/v1/tickets`
  - `POST /api/v1/tickets`
  - `PATCH /api/v1/tickets/:id`
- Read API configuration from environment variables such as `VITE_API_BASE_URL`.
- Add a ticket list view with a table showing `subject`, `channel`, `status`, `priority`, `assigned_to`, and `created_at`.
- Add user-facing filters for at least `status` and `priority`.
- Add pagination that updates ticket list queries and rendered results.
- Add create-ticket modal or view with form validation.
- Add edit-ticket behavior for existing tickets.
- Add loading, empty, and error states for the list and graceful API error feedback.
- Add frontend behavior tests using Vitest plus Vue-focused testing utilities and API mocking.
- Require the frontend implementation tasks to follow red-green-refactor: failing behavior test first, minimal implementation second, refactor last.

## Capabilities

### New Capabilities

- `ticket-management-ui`: Defines the frontend ticket management behavior, including list rendering, filters, pagination, create/edit flows, validation, API integration, and user-facing loading/empty/error states.
- `frontend-test-workflow`: Defines the frontend TDD workflow and required behavior-driven component/integration test coverage.

### Modified Capabilities

- None.

## Impact

- New frontend application source, package scripts, TypeScript configuration, Vuetify setup, and test setup.
- New API client code consuming the existing ticket backend contract without changing backend endpoints.
- New frontend test dependencies such as Vitest, Vue Test Utils or Testing Library for Vue, and MSW or equivalent request mocking.
- Backend behavior is consumed as-is; backend contract changes are out of scope unless implementation uncovers a bug.
