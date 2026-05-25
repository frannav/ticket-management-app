## ADDED Requirements

### Requirement: Backend project structure
The repository SHALL include a `/backend` Node.js and TypeScript service that exposes the ticket API.

#### Scenario: Backend source exists
- **WHEN** the backend change is implemented
- **THEN** `/backend` contains the service source, package scripts, TypeScript configuration, and test configuration needed to run and test the API

### Requirement: MongoDB persistence
The backend SHALL persist tickets in MongoDB and read connection configuration from environment variables.

#### Scenario: Persist ticket data
- **WHEN** a ticket is created through the API
- **THEN** the ticket is persisted in MongoDB
- **AND** subsequent API requests can retrieve it by id or through listing filters

#### Scenario: Configure database connection
- **WHEN** the backend starts
- **THEN** it reads MongoDB connection settings from environment variables suitable for local development and tests
- **AND** it fails fast with a clear error when required database configuration is missing

### Requirement: Dockerized local development
The repository SHALL provide Docker configuration for local backend development.

#### Scenario: Start MongoDB with Docker Compose
- **WHEN** a developer runs the documented Docker Compose command
- **THEN** a MongoDB service starts with the required local development environment variables
- **AND** the backend can connect to that MongoDB instance

#### Scenario: Build backend container
- **WHEN** a developer builds the backend Dockerfile
- **THEN** the backend service image builds successfully from the `/backend` source

### Requirement: Consistent error handling
The backend SHALL return consistent JSON error responses for validation errors, missing resources, and unexpected failures.

#### Scenario: Validation error response
- **WHEN** a request fails input validation
- **THEN** the API responds with the appropriate 4xx status
- **AND** the response body includes a stable error `code`, human-readable `message`, and optional field-level `details`

#### Scenario: Not found error response
- **WHEN** a requested ticket is missing, invalid, or soft-deleted
- **THEN** the API responds with HTTP `404`
- **AND** the response body includes a stable not-found error `code` and `message`

#### Scenario: Unexpected error response
- **WHEN** an unexpected server error occurs
- **THEN** the API responds with HTTP `500`
- **AND** the response body does not expose stack traces or internal implementation details

### Requirement: Minimal logging
The backend SHALL provide minimal useful logging for local development and debugging.

#### Scenario: Log request lifecycle and errors
- **WHEN** the backend handles API requests or errors
- **THEN** it logs concise request and error information without logging sensitive data or full stack traces in normal responses

### Requirement: TDD-oriented endpoint tests
The backend SHALL include behavior-driven endpoint integration tests that are written before implementation for each main endpoint.

#### Scenario: Endpoint test coverage
- **WHEN** the backend test suite is complete for this change
- **THEN** it includes tests for creating a ticket, listing tickets with filters, retrieving a ticket by id, updating a ticket, and soft-deleting a ticket

#### Scenario: Isolated test database
- **WHEN** endpoint tests run
- **THEN** they use an isolated MongoDB test database
- **AND** test ticket data is cleaned between tests
- **AND** local development data is not modified

#### Scenario: Red-green-refactor workflow is followed
- **WHEN** each main ticket endpoint is implemented
- **THEN** a failing endpoint test exists before the endpoint implementation is added
- **AND** the implementation is limited to the minimum needed to make the test pass before refactoring
