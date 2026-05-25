## 1. Define expected quality checks first

- [x] 1.1 Write the CI/lint verification checklist in implementation notes before changing package files or workflow files.
- [x] 1.2 Confirm the package manager and lockfile strategy for `/backend` and `/frontend`; document that the current repository uses npm lockfiles and `npm ci`.
- [x] 1.3 Confirm available backend scripts for lint, test, build, and typecheck; identify that lint must become Oxlint and TypeScript checking must remain separate.
- [x] 1.4 Confirm available frontend scripts for lint, test, build, and typecheck; identify that a frontend lint script must be added.
- [x] 1.5 Confirm backend test MongoDB requirements so CI can provide a reachable test database.

## 2. Add Oxlint dependencies and scripts

- [x] 2.1 Add Oxlint as a backend development dependency without introducing ESLint unless a blocker is documented.
- [x] 2.2 Add Oxlint as a frontend development dependency without introducing ESLint unless a blocker is documented.
- [x] 2.3 Update `/backend/package.json` so `lint` runs Oxlint and TypeScript no-emit checking remains available through a separate `typecheck` and/or existing `build` script.
- [x] 2.4 Update `/frontend/package.json` so `lint` runs Oxlint and existing `typecheck` and `build` scripts remain separate from linting.
- [x] 2.5 Add minimal Oxlint configuration only if needed for the repository to lint pragmatically; avoid excessive rule customization.
- [x] 2.6 Evaluate whether a root-level lint command fits the current repository structure; add a minimal delegating script if clean, otherwise document per-app lint commands only.

## 3. Run local quality checks before CI

- [x] 3.1 Run backend dependency installation with `npm ci` or verify the updated lockfile is reproducible.
- [x] 3.2 Run frontend dependency installation with `npm ci` or verify the updated lockfile is reproducible.
- [x] 3.3 Run backend lint and fix only lint issues required for Oxlint to pass.
- [x] 3.4 Run frontend lint and fix only lint issues required for Oxlint to pass.
- [x] 3.5 Run backend tests with the required MongoDB test URI available.
- [x] 3.6 Run frontend tests if the test script exists.
- [x] 3.7 Run backend build or typecheck using the available package script.
- [x] 3.8 Run frontend build or typecheck using the available package script.

## 4. Add GitHub Actions CI workflow

- [x] 4.1 Create `.github/workflows/ci.yml` with `push` and `pull_request` triggers.
- [x] 4.2 Configure a stable Node.js version compatible with the project, preferring Node.js 22 for the current repository.
- [x] 4.3 Configure dependency caching through `actions/setup-node` using the backend and frontend npm lockfiles where practical.
- [x] 4.4 Add backend CI steps or a backend job for `npm ci`, backend lint, backend tests with MongoDB available, and backend build or typecheck.
- [x] 4.5 Add frontend CI steps or a frontend job for `npm ci`, frontend lint, frontend tests if present, and frontend build or typecheck if available.
- [x] 4.6 Keep backend and frontend checks clearly separated with readable job or step names.
- [x] 4.7 Confirm the workflow contains no deployment, hosting, Docker image publishing, Kubernetes, release, or semantic-release steps.

## 5. Document and verify final quality workflow

- [x] 5.1 Add a short root README note covering backend lint, frontend lint, tests, build/typecheck checks, and CI triggers without rewriting the whole README.
- [x] 5.2 Re-run all local commands that CI is expected to run and record pass/fail outcomes.
- [x] 5.3 Run OpenSpec status for `quality-tooling-ci` and confirm the change remains ready for implementation review.
- [x] 5.4 Review changed files to ensure no backend product behavior, frontend product behavior, production deployment, or advanced monorepo tooling was introduced.
- [x] 5.5 Summarize final verification results and any known warnings or limitations for the reviewer.
