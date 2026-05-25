## ADDED Requirements

### Requirement: Backend Oxlint command
The backend project SHALL provide an npm lint command that runs Oxlint/Oxc linting against backend JavaScript and TypeScript source, test, and configuration files without replacing TypeScript build or typecheck commands.

#### Scenario: Backend lint command runs Oxlint
- **WHEN** a developer runs the backend lint command from `/backend`
- **THEN** Oxlint/Oxc linting is executed for backend code
- **AND** TypeScript type checking remains available through a separate build or typecheck command

### Requirement: Frontend Oxlint command
The frontend project SHALL provide an npm lint command that runs Oxlint/Oxc linting against frontend JavaScript, TypeScript, Vue-related TypeScript, test, and configuration files without replacing TypeScript build or typecheck commands.

#### Scenario: Frontend lint command runs Oxlint
- **WHEN** a developer runs the frontend lint command from `/frontend`
- **THEN** Oxlint/Oxc linting is executed for frontend code
- **AND** TypeScript and Vue type checking remain available through separate build or typecheck commands

### Requirement: Pragmatic lint configuration
The repository SHALL use a pragmatic Oxlint configuration suitable for a technical test, with minimal rule customization and no ESLint dependency unless Oxlint cannot satisfy the linting requirement.

#### Scenario: Lint configuration is lightweight
- **WHEN** a reviewer inspects the lint setup
- **THEN** the setup uses Oxlint as the primary linter
- **AND** it avoids excessive custom rules, unrelated formatter changes, and ESLint unless explicitly justified by an implementation blocker

### Requirement: Optional root lint command
The repository SHALL provide a root-level lint command only if the existing repository structure can support it cleanly without introducing advanced monorepo tooling.

#### Scenario: Root lint command is supported
- **WHEN** a root lint command is added
- **THEN** it delegates to backend and frontend lint commands
- **AND** it does not require changing the project to a complex workspace or adding unrelated root dependencies

#### Scenario: Root lint command is not supported cleanly
- **WHEN** the implementation determines a root lint command would add unnecessary tooling or ambiguity
- **THEN** the README documents the backend and frontend lint commands separately

### Requirement: CI workflow triggers
The repository SHALL include `.github/workflows/ci.yml` configured to run on `push` and `pull_request`.

#### Scenario: Push triggers CI
- **WHEN** code is pushed to a branch with the workflow present
- **THEN** GitHub Actions starts the CI verification workflow

#### Scenario: Pull request triggers CI
- **WHEN** a pull request is opened or updated
- **THEN** GitHub Actions starts the CI verification workflow

### Requirement: CI dependency installation
The CI workflow SHALL install backend and frontend dependencies with the repository's existing package manager and lockfiles.

#### Scenario: npm lockfiles are used
- **WHEN** the workflow runs for the current repository structure
- **THEN** backend dependencies are installed with `npm ci` in `/backend`
- **AND** frontend dependencies are installed with `npm ci` in `/frontend`
- **AND** setup-node dependency caching is used where practical

### Requirement: CI backend verification
The CI workflow SHALL verify backend dependency installation, backend linting, backend tests, and backend build or typecheck checks.

#### Scenario: Backend CI checks pass
- **WHEN** the backend CI job or backend CI steps run
- **THEN** backend dependencies install successfully
- **AND** backend Oxlint linting passes
- **AND** backend tests pass with required MongoDB test connectivity available
- **AND** backend build or typecheck passes using the available package script

### Requirement: CI frontend verification
The CI workflow SHALL verify frontend dependency installation, frontend linting, frontend tests when present, and frontend build or typecheck checks when available.

#### Scenario: Frontend CI checks pass
- **WHEN** the frontend CI job or frontend CI steps run
- **THEN** frontend dependencies install successfully
- **AND** frontend Oxlint linting passes
- **AND** frontend tests pass if a frontend test script exists
- **AND** frontend build or typecheck passes using the available package script

### Requirement: CI remains build verification only
The CI workflow SHALL remain limited to installation, lint, test, build, and typecheck verification and MUST NOT deploy to real environments, publish Docker images, or run release automation.

#### Scenario: CI has no deployment
- **WHEN** a reviewer inspects `.github/workflows/ci.yml`
- **THEN** the workflow contains no production deployment, hosting, Docker image publishing, Kubernetes, semantic-release, or cloud release steps

### Requirement: README documents quality checks
The root README SHALL include a concise note explaining local lint commands and the GitHub Actions CI checks without rewriting the full delivery documentation.

#### Scenario: Reviewer finds quality-check documentation
- **WHEN** a reviewer reads the README quality-checks note
- **THEN** the reviewer can identify how to run backend lint, frontend lint, tests, and build/typecheck checks locally
- **AND** the note states that CI runs equivalent verification on push and pull request
