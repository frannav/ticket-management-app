## 1. Frontend scaffold and test harness

- [x] 1.1 Create `/frontend` Vue 3 + TypeScript + Vite project structure without implementing ticket behavior.
- [x] 1.2 Add Vuetify, Pinia if needed, Vitest, Vue Test Utils or Testing Library for Vue, jsdom/happy-dom, and MSW or equivalent API-mocking dependencies.
- [x] 1.3 Add frontend scripts for development, build/typecheck, test, and test watch.
- [x] 1.4 Configure TypeScript, Vite, Vitest, Vuetify test mounting helpers, and API mock setup.
- [x] 1.5 Add `VITE_API_BASE_URL` environment example and document how the frontend points at the backend API.
- [x] 1.6 GREEN: Add only the minimum app shell needed for the test harness to mount Vue with Vuetify successfully.
- [x] 1.7 REFACTOR: Clean up scaffold naming and helper structure while keeping the initial frontend test suite green.

## 2. Ticket API client - red, green, refactor

- [x] 2.1 RED: Add failing tests for building `GET /api/v1/tickets` requests from `VITE_API_BASE_URL` with `page`, `page_size`, `status`, and `priority` query parameters.
- [x] 2.2 RED: Add failing tests for API error normalization from backend error responses and unexpected failures.
- [x] 2.3 GREEN: Implement the minimum typed ticket API client for list, create, and patch operations needed by the tests.
- [x] 2.4 REFACTOR: Extract shared response parsing, query serialization, and ticket types while keeping API client tests green.

## 3. Ticket list states - red, green, refactor

- [x] 3.1 RED: Add a failing behavior test proving the ticket list shows a loading state while the list request is pending.
- [x] 3.2 GREEN: Implement the minimum ticket list view async loading flow and Vuetify loading UI to pass the loading test.
- [x] 3.3 RED: Add a failing behavior test proving returned tickets render in a table with `subject`, `channel`, `status`, `priority`, `assigned_to`, and `created_at`.
- [x] 3.4 GREEN: Implement the minimum Vuetify table rendering for returned tickets, including a clear value for unassigned tickets.
- [x] 3.5 RED: Add a failing behavior test proving an empty API response shows an empty state and no stale rows.
- [x] 3.6 GREEN: Implement the empty state for successful responses with no tickets.
- [x] 3.7 RED: Add a failing behavior test proving API failure shows a user-facing error state.
- [x] 3.8 GREEN: Implement graceful list error handling and a visible retry or recovery path.
- [x] 3.9 REFACTOR: Simplify list state naming and rendering boundaries while keeping all list-state tests green.

## 4. Ticket filters - red, green, refactor

- [x] 4.1 RED: Add a failing behavior test proving selecting a status filter sends the selected `status` query parameter and renders the mocked filtered results.
- [x] 4.2 GREEN: Implement the minimum Vuetify status filter and list reload behavior needed to pass the status filter test.
- [x] 4.3 RED: Add a failing behavior test proving clearing the status filter omits `status` from the next query.
- [x] 4.4 GREEN: Implement status filter clearing and query reset behavior.
- [x] 4.5 RED: Add a failing behavior test proving selecting a priority filter sends the selected `priority` query parameter and renders the mocked filtered results.
- [x] 4.6 GREEN: Implement the minimum Vuetify priority filter and list reload behavior needed to pass the priority filter test.
- [x] 4.7 RED: Add a failing behavior test proving clearing the priority filter omits `priority` from the next query.
- [x] 4.8 GREEN: Implement priority filter clearing and query reset behavior.
- [x] 4.9 REFACTOR: Consolidate filter option constants and query state handling while keeping filter tests green.

## 5. Ticket pagination - red, green, refactor

- [x] 5.1 RED: Add a failing behavior test proving the initial list request uses the first page and displays pagination metadata from the API.
- [x] 5.2 GREEN: Implement the minimum pagination state and Vuetify pagination controls for the first page.
- [x] 5.3 RED: Add a failing behavior test proving changing page sends the selected `page` query parameter and renders the mocked page results.
- [x] 5.4 GREEN: Implement page-change handling and list reload behavior.
- [x] 5.5 RED: Add a failing behavior test proving changing `status` or `priority` resets pagination to page 1.
- [x] 5.6 GREEN: Implement filter-driven page reset behavior.
- [x] 5.7 REFACTOR: Keep pagination state derived from backend metadata where possible while keeping pagination tests green.

## 6. Create ticket flow - red, green, refactor

- [x] 6.1 RED: Add a failing behavior test proving submitting an empty create form shows required-field validation messages and does not call `POST /api/v1/tickets`.
- [x] 6.2 GREEN: Implement the minimum create modal or view with required-field validation for `hotel_id`, `subject`, `description`, `channel`, and `priority`.
- [x] 6.3 RED: Add a failing behavior test proving a subject longer than 200 characters is rejected before the API call.
- [x] 6.4 GREEN: Implement subject length validation.
- [x] 6.5 RED: Add a failing behavior test proving a valid create submission calls `POST /api/v1/tickets` with the expected payload.
- [x] 6.6 GREEN: Implement create submission through the API client.
- [x] 6.7 RED: Add a failing behavior test proving successful creation refreshes or updates the visible ticket list and closes or resets the form.
- [x] 6.8 GREEN: Implement post-create list refresh or local update behavior.
- [x] 6.9 RED: Add a failing behavior test proving create API failure displays a user-facing error and preserves entered values.
- [x] 6.10 GREEN: Implement create error handling.
- [x] 6.11 REFACTOR: Extract a shared ticket form component only if duplication or readability justifies it, keeping create tests green.

## 7. Edit ticket flow - red, green, refactor

- [x] 7.1 RED: Add a failing behavior test proving selecting edit opens a form populated with the existing ticket values.
- [x] 7.2 GREEN: Implement the minimum edit action and populated edit form.
- [x] 7.3 RED: Add a failing behavior test proving valid edits call `PATCH /api/v1/tickets/:id` with the expected payload.
- [x] 7.4 GREEN: Implement edit submission through the API client.
- [x] 7.5 RED: Add a failing behavior test proving successful edit reflects the updated ticket data in the table.
- [x] 7.6 GREEN: Implement post-edit list refresh or local update behavior.
- [x] 7.7 RED: Add a failing behavior test proving edit API failure shows a user-facing error and does not replace the row with unconfirmed data.
- [x] 7.8 GREEN: Implement edit error handling.
- [x] 7.9 REFACTOR: Reuse create/edit form logic where it reduces duplication, keeping edit and create tests green.

## 8. Final integration, verification, and documentation

- [x] 8.1 Run the complete frontend test suite and keep it green.
- [x] 8.2 Run frontend build/typecheck and fix TypeScript or Vuetify integration issues.
- [x] 8.3 Manually verify the frontend against the local backend for list, filters, pagination, create, edit, loading, empty, and error states.
- [x] 8.4 Update root and/or frontend README instructions for starting the frontend, configuring `VITE_API_BASE_URL`, running tests, and known production follow-ups.
- [x] 8.5 Confirm no backend contract changes were introduced unless separately justified by a discovered backend bug.
- [x] 8.6 Run `openspec status --change ticket-management-ui` and ensure the change is ready for implementation review.
