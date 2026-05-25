## Why

The backend API and frontend UI are implemented, but the repository still lacks automated quality checks that prove the submission remains installable, lintable, testable, and buildable after changes. Adding lightweight CI and Oxlint-based linting makes the technical test easier to review without expanding into production delivery or complex monorepo tooling.

## What Changes

- Add pragmatic Oxlint/Oxc linting for both `/backend` and `/frontend`.
- Update backend and frontend package scripts so linting is distinct from TypeScript build/typecheck commands.
- Add a root-level lint command if the existing repository structure can support it without introducing heavy tooling.
- Add `.github/workflows/ci.yml` for basic verification on `push` and `pull_request`.
- Configure CI to install backend and frontend dependencies with the existing package manager, run backend and frontend linting, run backend tests, run frontend tests if present, and run available build/typecheck checks.
- Keep the workflow focused on CI/build verification only; do not add deployment, image publishing, release automation, or new product behavior.
- Add a short README note documenting the lint and CI checks without rewriting delivery documentation.

## Capabilities

### New Capabilities

- `quality-tooling-ci`: Defines repository quality-tooling behavior for Oxlint lint commands, separated typecheck/build verification, and GitHub Actions CI checks across backend and frontend.

### Modified Capabilities

- None.

## Impact

- Backend and frontend package metadata/scripts will be updated.
- Oxlint will be added as a development dependency where needed.
- A root-level package script may be added if it fits the repository structure cleanly.
- A new GitHub Actions workflow will be added under `.github/workflows/ci.yml`.
- The root README will receive a brief quality-checks note.
- Existing backend/frontend runtime behavior, API contracts, UI behavior, deployment model, and Docker publishing remain unchanged.
