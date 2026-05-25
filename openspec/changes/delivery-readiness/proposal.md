## Why

The backend API and frontend UI are already implemented, but the repository still needs a reviewer-friendly delivery layer that proves the project can be run, tested, reviewed, and defended quickly. This change turns the existing implementation into a polished technical-test submission without rewriting product behavior.

## What Changes

- Add a concise root `README.md` covering overview, stack, setup, tests, environment variables, technical decisions, production readiness, AI usage, TDD-oriented approach, known limitations, and the required scalability answer.
- Define and document the full local development flow for MongoDB, backend, and frontend.
- Verify or add root-level Docker Compose support for local MongoDB and, where useful, backend/frontend services.
- Verify backend dependency installation, test execution, MongoDB connectivity via documented environment variables, and backend Dockerfile usability.
- Verify frontend dependency installation, local start command, build/typecheck where applicable, and API configuration via `VITE_API_BASE_URL` or equivalent.
- Add final repository sanity checks focused on structure, copy-paste commands, and reviewer experience.
- Capture technical decisions and production-readiness trade-offs made under the 3–4 hour time constraint.
- Do not rewrite already implemented backend or frontend features unless a delivery-blocking issue is discovered.

## Capabilities

### New Capabilities

- `delivery-readiness`: Defines the repository-level delivery requirements for setup documentation, Docker Compose local development, environment variable documentation, verification commands, reviewer guidance, production-readiness notes, AI usage declaration, and scalability answer.

### Modified Capabilities

- None.

## Impact

- Root-level documentation and local-development configuration may be added or updated.
- Existing `/backend` and `/frontend` configuration may receive small delivery-focused fixes only if verification exposes a blocker.
- Existing backend/frontend product behavior, API contract, and UI architecture remain out of scope.
- Docker Compose is expected at the repository root if used for the local development flow.
