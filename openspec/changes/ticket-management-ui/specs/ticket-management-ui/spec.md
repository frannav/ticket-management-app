## ADDED Requirements

### Requirement: Frontend application shell
The system SHALL provide a Vue 3 and TypeScript frontend application for ticket management using Vuetify components.

#### Scenario: Application loads ticket management UI
- **WHEN** a user opens the frontend application
- **THEN** the application displays a ticket management screen
- **AND** the screen uses Vuetify-based layout and controls

### Requirement: Environment-based ticket API configuration
The frontend SHALL configure ticket API requests from environment configuration such as `VITE_API_BASE_URL`.

#### Scenario: API client uses configured base URL
- **WHEN** the frontend requests tickets
- **THEN** it sends the request to the configured API base URL with the `/api/v1/tickets` path

#### Scenario: API request failure is user-visible
- **WHEN** the ticket API request fails because the API is unavailable or returns an error
- **THEN** the frontend displays a graceful user-facing error state
- **AND** the frontend does not expose raw stack traces

### Requirement: Ticket list table
The frontend SHALL display tickets in a table with the required ticket columns.

#### Scenario: Render returned tickets
- **WHEN** the ticket list request returns one or more tickets
- **THEN** the table displays a row for each returned ticket
- **AND** the table includes `subject`, `channel`, `status`, `priority`, `assigned_to`, and `created_at`

#### Scenario: Show unassigned tickets clearly
- **WHEN** a returned ticket has `assigned_to` set to `null`
- **THEN** the table displays a clear unassigned value instead of an empty broken cell

### Requirement: Ticket list loading state
The frontend SHALL show a loading state while tickets are being fetched.

#### Scenario: Show loading while fetching data
- **WHEN** the ticket list request is in progress
- **THEN** the frontend displays a visible loading indicator or loading table state
- **AND** the loading state is removed after the request settles

### Requirement: Ticket list empty state
The frontend SHALL show an empty state when the ticket API returns no tickets for the current query.

#### Scenario: Show empty state for no tickets
- **WHEN** the ticket list request succeeds with an empty `data` array
- **THEN** the frontend displays a user-facing empty state
- **AND** the frontend does not display stale ticket rows from a previous query

### Requirement: Ticket list error state
The frontend SHALL show an error state when the ticket list API request fails.

#### Scenario: Show error state on list failure
- **WHEN** the ticket list request fails
- **THEN** the frontend displays a user-facing error message
- **AND** the frontend provides a way to retry or recover by changing the query

### Requirement: Status filtering
The frontend SHALL provide a status filter that updates the ticket list query and visible results.

#### Scenario: Filter tickets by status
- **WHEN** a user selects a ticket status filter
- **THEN** the next ticket list request includes the selected `status` query parameter
- **AND** the rendered ticket rows reflect the filtered API response

#### Scenario: Clear status filter
- **WHEN** a user clears the selected status filter
- **THEN** the next ticket list request omits the `status` query parameter
- **AND** the rendered ticket rows reflect the unfiltered API response for the remaining query

### Requirement: Priority filtering
The frontend SHALL provide a priority filter that updates the ticket list query and visible results.

#### Scenario: Filter tickets by priority
- **WHEN** a user selects a ticket priority filter
- **THEN** the next ticket list request includes the selected `priority` query parameter
- **AND** the rendered ticket rows reflect the filtered API response

#### Scenario: Clear priority filter
- **WHEN** a user clears the selected priority filter
- **THEN** the next ticket list request omits the `priority` query parameter
- **AND** the rendered ticket rows reflect the unfiltered API response for the remaining query

### Requirement: Ticket pagination
The frontend SHALL provide pagination controls backed by the API `page`, `page_size`, `total`, and `total_pages` metadata.

#### Scenario: Initial paginated request
- **WHEN** the ticket list first loads
- **THEN** the frontend requests the first page of tickets
- **AND** the frontend displays pagination controls using the response pagination metadata

#### Scenario: Change page
- **WHEN** a user selects another page
- **THEN** the next ticket list request includes the selected `page` query parameter
- **AND** the rendered ticket rows reflect the returned page

#### Scenario: Filters reset pagination
- **WHEN** a user changes the status or priority filter
- **THEN** the frontend requests the first page for the new filter query

### Requirement: Create ticket form validation
The frontend SHALL validate required create-ticket fields before submitting to the API.

#### Scenario: Reject missing required create fields
- **WHEN** a user submits the create ticket form without required fields
- **THEN** the frontend displays validation messages for the missing required fields
- **AND** the frontend does not call `POST /api/v1/tickets`

#### Scenario: Reject overlong subject
- **WHEN** a user enters a subject longer than 200 characters and submits the create ticket form
- **THEN** the frontend displays a validation message for the subject length
- **AND** the frontend does not call `POST /api/v1/tickets`

### Requirement: Create ticket API integration
The frontend SHALL create tickets through `POST /api/v1/tickets` and update the visible list after success.

#### Scenario: Create valid ticket
- **WHEN** a user submits a valid create ticket form
- **THEN** the frontend calls `POST /api/v1/tickets` with `hotel_id`, `subject`, `description`, `channel`, `priority`, and any provided optional fields
- **AND** the frontend shows the newly created ticket in the list or refreshes the list so the created ticket is visible when it matches the current query
- **AND** the create form closes or resets after success

#### Scenario: Show create API error
- **WHEN** a valid create ticket submission fails at the API
- **THEN** the frontend displays a user-facing error message
- **AND** the user-entered form values remain available for correction or retry

### Requirement: Edit ticket API integration
The frontend SHALL allow editing an existing ticket and persist changes through `PATCH /api/v1/tickets/:id`.

#### Scenario: Open edit form with existing ticket values
- **WHEN** a user chooses to edit a ticket from the table
- **THEN** the frontend displays an edit form populated with that ticket's current editable values

#### Scenario: Submit valid ticket edit
- **WHEN** a user submits valid edits for an existing ticket
- **THEN** the frontend calls `PATCH /api/v1/tickets/:id` for that ticket
- **AND** the frontend reflects the updated ticket data in the table after the request succeeds

#### Scenario: Show edit API error
- **WHEN** an edit submission fails at the API
- **THEN** the frontend displays a user-facing error message
- **AND** the existing ticket row is not replaced with unconfirmed data

### Requirement: Graceful API error handling
The frontend SHALL parse backend error responses when possible and show concise user-facing feedback.

#### Scenario: Backend validation error
- **WHEN** the backend returns a validation error response
- **THEN** the frontend displays a concise validation or submission error message to the user

#### Scenario: Unexpected backend error
- **WHEN** the backend returns an unexpected server error response
- **THEN** the frontend displays a generic failure message suitable for retry
