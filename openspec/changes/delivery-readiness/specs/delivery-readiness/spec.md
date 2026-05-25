## ADDED Requirements

### Requirement: Repository structure is reviewer-ready
The repository SHALL expose the expected technical-test structure at the root level, including `/backend`, `/frontend`, `README.md`, and `docker-compose.yml` when Docker Compose is part of the local development flow.

#### Scenario: Reviewer inspects repository layout
- **WHEN** a reviewer lists the repository root
- **THEN** the reviewer can identify the backend service, frontend service, root README, and Docker Compose entry point without reading implementation code first

### Requirement: Local setup instructions are copy-paste friendly
The root README SHALL provide concise local setup instructions for installing backend and frontend dependencies, starting MongoDB, starting the backend, starting the frontend, and verifying the application is reachable.

#### Scenario: Reviewer follows local setup
- **WHEN** a reviewer follows the root README setup commands from a clean checkout with required tools installed
- **THEN** MongoDB starts through Docker Compose, backend dependencies install, frontend dependencies install, and both services can be started with documented commands

### Requirement: Test and build commands are documented and verified
The root README SHALL document backend tests, frontend tests, backend build or typecheck, and frontend build or typecheck commands, and the delivery task list SHALL require these commands to be executed during implementation.

#### Scenario: Reviewer runs verification commands
- **WHEN** a reviewer runs the documented test and build commands
- **THEN** the commands match the repository scripts and either pass or have an explicitly documented limitation

### Requirement: Environment variables are documented
The root README SHALL document required and optional environment variables for backend and frontend local development, including MongoDB connection values and `VITE_API_BASE_URL` or its equivalent.

#### Scenario: Reviewer configures services
- **WHEN** a reviewer creates local environment files from documented examples
- **THEN** the backend can connect to MongoDB with the documented `MONGODB_URI` and the frontend can target the backend with the documented API base URL behavior

### Requirement: Docker Compose supports local infrastructure
The repository SHALL provide a root Docker Compose local-development path that starts MongoDB and, if verified as useful, backend and/or frontend services.

#### Scenario: Reviewer starts MongoDB through Docker Compose
- **WHEN** a reviewer runs the documented Docker Compose command for MongoDB
- **THEN** MongoDB starts with a persistent volume and a documented connection string usable by the backend and backend tests

#### Scenario: Reviewer uses optional app services
- **WHEN** Docker Compose includes backend or frontend application services
- **THEN** the README documents their purpose, required profiles or commands, ports, and environment variables

### Requirement: Backend container readiness is verified
The delivery process SHALL verify the backend Dockerfile by building it or by running the documented Docker Compose backend path when included.

#### Scenario: Backend Docker image is checked
- **WHEN** the backend Dockerfile is built during delivery verification
- **THEN** the build succeeds or a delivery-blocking issue is fixed before the change is complete

### Requirement: Frontend runtime configuration and build are verified
The delivery process SHALL verify the frontend can be started with documented local commands and can be configured to call the backend through `VITE_API_BASE_URL` or equivalent configuration.

#### Scenario: Frontend local startup is documented
- **WHEN** a reviewer starts the frontend using the README command
- **THEN** the frontend runs against the documented backend API base URL configuration

#### Scenario: Frontend build is checked
- **WHEN** frontend build or typecheck is applicable
- **THEN** the documented command is executed during delivery verification and any failure is fixed or honestly documented

### Requirement: Root README explains review and defense topics
The root README SHALL include project overview, tech stack, local start, tests, environment variables, main technical decisions, production-readiness improvements, AI usage declaration, known limitations, and a short TDD-oriented approach section.

#### Scenario: Reviewer reads the README before code
- **WHEN** a reviewer reads only the root README
- **THEN** the reviewer understands what was built, how to run it, how to test it, what trade-offs were made, and what remains for production

### Requirement: Scalability answer is concise and concrete
The root README SHALL answer: "Imagine the API goes from 1,000 tickets/day to 100,000 tickets/day. What would you change? Give 3 concrete changes and explain why." The answer MUST contain exactly three concrete changes and MUST be no more than 250 words.

#### Scenario: Reviewer checks scalability answer
- **WHEN** a reviewer reads the scalability section
- **THEN** it contains exactly three realistic changes with brief explanations focused on scaling from 1,000 to 100,000 tickets per day

### Requirement: Final sanity checks are explicit
The delivery task list SHALL require a final repository sanity pass covering expected structure, documented commands, service configuration, OpenSpec status, and avoidance of unintended product-feature changes.

#### Scenario: Delivery change is ready for implementation review
- **WHEN** all delivery-readiness tasks are complete
- **THEN** the repository has passing or explicitly documented delivery checks and no unnecessary backend or frontend feature rewrites
