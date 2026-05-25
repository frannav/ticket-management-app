## Context

The repository already contains a completed `/backend` service for the ticket API under the `ticket-api-core` change. The frontend now needs to provide a small, defendable Vue application for contact-center agents to list, filter, create, and edit tickets against that existing API contract.

The frontend must stay pragmatic for a 3–4 hour technical test: Vue 3, TypeScript, Vuetify, behavior-driven tests, and minimal architecture. The backend exposes tickets through `/api/v1/tickets`, returns list responses as `{ data, pagination }`, and supports `status`, `priority`, `page`, and `page_size` query parameters. API configuration must be environment-based, with `VITE_API_BASE_URL` as the primary mechanism.

## Goals / Non-Goals

**Goals:**

- Add a `/frontend` Vue 3 + TypeScript app using Vuetify.
- Provide a ticket list table with the required columns and visible loading, empty, and error states.
- Support `status` and `priority` filters that update the API query and rendered results.
- Support pagination that updates the API query and rendered results.
- Provide create and edit UI with validation and graceful API error feedback.
- Keep API integration centralized in a small client module.
- Use Pinia or a composable only if it improves clarity for shared loading/error/list state.
- Drive implementation through frontend tests before UI/application code for each main behavior.

**Non-Goals:**

- No authentication or authorization.
- No backend contract rewrite unless a frontend test exposes a backend bug.
- No pixel-perfect visual design beyond clean Vuetify defaults.
- No advanced design system, component library, or generic CRUD framework.
- No end-to-end browser suite unless there is time after required behavior tests.
- No complex caching, optimistic concurrency, offline support, or realtime updates.

## Decisions

### Use a `/frontend` Vue 3 + Vite application

- **Decision:** Add the frontend under `/frontend` using Vue 3, TypeScript, and Vite.
- **Rationale:** Vite is the standard lightweight Vue setup, keeps dev/test feedback fast, and aligns with `VITE_API_BASE_URL` environment variables.
- **Alternatives considered:** Nuxt would add routing/server-rendering concepts that are unnecessary. A custom bundler setup would be slower to explain and maintain.

### Use Vuetify defaults for layout and form controls

- **Decision:** Use Vuetify components for the app shell, ticket table, selects, buttons, dialogs/cards, form inputs, alerts, and pagination controls.
- **Rationale:** Vuetify is required by the test and provides accessible, defendable defaults without spending time on custom styling.
- **Alternatives considered:** Hand-built CSS would not meet the component-library requirement. A larger custom theme is out of scope.

### Keep the application structure shallow

- **Decision:** Use pages/views for main screens, a small API client module, and extract reusable components only when duplication appears. A suggested structure is:
  - `src/main.ts`
  - `src/App.vue`
  - `src/plugins/vuetify.ts`
  - `src/api/tickets.ts`
  - `src/types/ticket.ts`
  - `src/views/TicketListView.vue`
  - `src/components/TicketFormDialog.vue` if create/edit form duplication appears
  - `src/stores/tickets.ts` or `src/composables/useTickets.ts` only if it keeps async state clearer
- **Rationale:** This is enough separation for readability without over-engineering a small test.
- **Alternatives considered:** A full feature-layer architecture with repositories, services, mappers, and domain models would be excessive.

### Centralize API calls and environment configuration

- **Decision:** Implement a small ticket API client that builds URLs from `VITE_API_BASE_URL`, serializes query parameters, parses JSON, and normalizes failed responses into user-facing errors.
- **Rationale:** Centralizing API behavior keeps components focused on user behavior and makes tests easier to mock.
- **Alternatives considered:** Calling `fetch` directly from every component is quick initially but scatters error handling and query construction.

### Prefer behavior-driven component/integration tests

- **Decision:** Use Vitest with Vue Test Utils or Testing Library for Vue. Mock HTTP with MSW or an equivalent boundary-level fetch mock.
- **Rationale:** The required tests are about what users observe: loading indicators, table rows, filters, pagination, validation messages, API calls, and updated data. Tests should not lock the implementation to component internals.
- **Alternatives considered:** Snapshot-heavy tests and isolated implementation-detail unit tests provide weaker confidence for this exercise.

### Use simple refresh-after-write behavior

- **Decision:** After a successful create or edit, refresh the current ticket list query or update the local list with the server response if that is simpler and equivalent for the UI.
- **Rationale:** Refreshing keeps pagination/filter semantics consistent with the backend and avoids premature client-side cache complexity.
- **Alternatives considered:** Fully optimistic updates could improve perceived speed but add edge cases that are unnecessary for the timebox.

### Validate required create/edit fields in the UI

- **Decision:** Validate required form fields before submitting. At minimum, creation requires `hotel_id`, `subject`, `description`, `channel`, and `priority`, with `subject` limited to 200 characters. Edit validates any edited values with the same enum and length constraints.
- **Rationale:** This mirrors the backend contract and gives immediate feedback before API submission.
- **Alternatives considered:** Relying only on backend validation is simpler but produces poorer UX and does not satisfy the create validation requirement.

## Risks / Trade-offs

- **TDD discipline can slip under time pressure** → Encode red-green-refactor directly in `tasks.md`, requiring a failing behavior test before each UI behavior is implemented.
- **Vuetify components can be harder to test by implementation detail** → Test accessible text, labels, roles, and user-visible behavior rather than internal Vuetify markup.
- **API base URL may be misconfigured locally** → Document `VITE_API_BASE_URL` and show a clear error state when requests fail.
- **Refresh-after-write may cost an extra request** → Accept the small overhead for simpler correctness in a technical test.
- **Form reuse can become awkward too early** → Start with straightforward form behavior and only extract a reusable form dialog/component when duplication between create and edit is real.
- **Pagination metadata edge cases depend on backend semantics** → Treat backend `pagination` as source of truth and keep frontend controls driven by `page`, `page_size`, `total`, and `total_pages`.
