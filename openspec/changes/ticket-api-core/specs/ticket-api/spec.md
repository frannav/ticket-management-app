## ADDED Requirements

### Requirement: Ticket representation
The ticket API SHALL represent each ticket with `id`, `hotel_id`, `subject`, `description`, `channel`, `status`, `priority`, `assigned_to`, `created_at`, `updated_at`, and `deleted_at`.

#### Scenario: Ticket response shape
- **WHEN** the API returns a non-deleted ticket
- **THEN** the response includes `id`, `hotel_id`, `subject`, `description`, `channel`, `status`, `priority`, `assigned_to`, `created_at`, `updated_at`, and `deleted_at`
- **AND** `channel` is one of `phone`, `email`, `chat`, or `social`
- **AND** `status` is one of `open`, `in_progress`, `resolved`, or `closed`
- **AND** `priority` is one of `low`, `medium`, `high`, or `urgent`

#### Scenario: Soft-deleted ticket response shape
- **WHEN** a ticket has been soft-deleted
- **THEN** its persisted `deleted_at` value is a datetime
- **AND** normal retrieve and list endpoints do not return that ticket

### Requirement: Create ticket endpoint
The system SHALL provide `POST /api/v1/tickets` to create a ticket.

#### Scenario: Create ticket with valid payload
- **WHEN** a client posts a valid ticket payload with `hotel_id`, `subject`, `description`, `channel`, and `priority`
- **THEN** the API responds with HTTP `201`
- **AND** the response body contains the created ticket with generated `id`, `created_at`, `updated_at`, and `deleted_at` set to `null`
- **AND** `status` defaults to `open` when not provided
- **AND** `assigned_to` defaults to `null` when not provided

#### Scenario: Reject invalid create payload
- **WHEN** a client posts a ticket payload with a missing required field, an invalid enum value, or a `subject` longer than 200 characters
- **THEN** the API responds with HTTP `400`
- **AND** the response body uses the standard error format
- **AND** no ticket is created

### Requirement: List tickets endpoint
The system SHALL provide `GET /api/v1/tickets` to list non-deleted tickets.

#### Scenario: List tickets without filters
- **WHEN** a client requests `GET /api/v1/tickets` without filters
- **THEN** the API responds with HTTP `200`
- **AND** the response body contains `data` with non-deleted tickets
- **AND** the response body contains pagination metadata

#### Scenario: List tickets with exact-match filters
- **WHEN** a client requests `GET /api/v1/tickets` with any combination of `hotel_id`, `status`, `priority`, `channel`, and `assigned_to`
- **THEN** the API responds with HTTP `200`
- **AND** every returned ticket matches all provided filters

#### Scenario: List tickets with text search
- **WHEN** a client requests `GET /api/v1/tickets?q=<term>`
- **THEN** the API responds with HTTP `200`
- **AND** every returned ticket matches the term in `subject` or `description`

#### Scenario: Reject invalid list filters
- **WHEN** a client requests `GET /api/v1/tickets` with invalid enum filters or invalid pagination parameters
- **THEN** the API responds with HTTP `400`
- **AND** the response body uses the standard error format

### Requirement: Paginate ticket listing
The list endpoint SHALL support `page` and `page_size` query parameters with a reasonable maximum page size.

#### Scenario: Default pagination
- **WHEN** a client requests `GET /api/v1/tickets` without pagination parameters
- **THEN** the API uses `page=1`
- **AND** the API uses `page_size=20`

#### Scenario: Custom pagination
- **WHEN** a client requests `GET /api/v1/tickets?page=2&page_size=10`
- **THEN** the API returns the second page of matching tickets with at most 10 items
- **AND** pagination metadata includes `page`, `page_size`, `total`, and `total_pages`

#### Scenario: Page size cap
- **WHEN** a client requests `GET /api/v1/tickets` with `page_size` greater than `100`
- **THEN** the API responds with HTTP `400`
- **AND** the response body indicates that `page_size` exceeds the maximum

### Requirement: Retrieve ticket endpoint
The system SHALL provide `GET /api/v1/tickets/:id` to retrieve one non-deleted ticket by id.

#### Scenario: Retrieve existing ticket
- **WHEN** a client requests an existing non-deleted ticket id
- **THEN** the API responds with HTTP `200`
- **AND** the response body contains that ticket

#### Scenario: Retrieve missing or deleted ticket
- **WHEN** a client requests a missing, invalid, or soft-deleted ticket id
- **THEN** the API responds with HTTP `404`
- **AND** the response body uses the standard error format

### Requirement: Update ticket endpoint
The system SHALL provide `PATCH /api/v1/tickets/:id` to partially update a non-deleted ticket.

#### Scenario: Update ticket with valid patch
- **WHEN** a client patches an existing non-deleted ticket with valid mutable fields
- **THEN** the API responds with HTTP `200`
- **AND** the response body contains the updated ticket
- **AND** `updated_at` is newer than the previous value

#### Scenario: Reject invalid update payload
- **WHEN** a client patches a ticket with an invalid enum value, an invalid field type, a `subject` longer than 200 characters, or immutable fields such as `id`, `created_at`, `updated_at`, or `deleted_at`
- **THEN** the API responds with HTTP `400`
- **AND** the response body uses the standard error format
- **AND** the ticket is not changed

#### Scenario: Update missing or deleted ticket
- **WHEN** a client patches a missing, invalid, or soft-deleted ticket id
- **THEN** the API responds with HTTP `404`
- **AND** the response body uses the standard error format

### Requirement: Soft delete ticket endpoint
The system SHALL provide `DELETE /api/v1/tickets/:id` to soft-delete a ticket.

#### Scenario: Soft delete existing ticket
- **WHEN** a client deletes an existing non-deleted ticket
- **THEN** the API responds with HTTP `204`
- **AND** the ticket remains persisted with `deleted_at` set to a datetime
- **AND** subsequent retrieve and list requests do not return the ticket

#### Scenario: Delete missing or already deleted ticket
- **WHEN** a client deletes a missing, invalid, or already soft-deleted ticket id
- **THEN** the API responds with HTTP `404`
- **AND** the response body uses the standard error format
