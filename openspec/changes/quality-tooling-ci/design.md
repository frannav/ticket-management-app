## Context

The repository contains two independent npm projects: `/backend` and `/frontend`. Both already have lockfiles, tests, and build/typecheck paths, but their quality commands are not consistently separated: the backend currently uses `lint` as a TypeScript no-emit check, while the frontend has no lint script. The root currently has no `package.json`, so any root-level command must be added deliberately and only if it helps reviewers without introducing unnecessary monorepo tooling.

This change adds lightweight quality tooling for a Senior Full-Stack technical-test submission. It must improve reviewer confidence while staying intentionally smaller than production CD, release automation, or advanced workspace orchestration.

## Goals / Non-Goals

**Goals:**

- Add Oxlint as the JavaScript/TypeScript linter for both backend and frontend.
- Keep linting separate from TypeScript type checking and builds.
- Add npm scripts that make backend and frontend quality checks discoverable and easy to run.
- Add a basic GitHub Actions workflow that verifies installs, linting, tests, and available build/typecheck checks on `push` and `pull_request`.
- Use the existing package manager and lockfiles; for the current repository that means npm with `npm ci`.
- Keep CI stages clearly separated between backend and frontend.
- Add a concise README note documenting local linting and CI verification.

**Non-Goals:**

- No deployment, hosting, Docker image publishing, Kubernetes, release automation, or semantic-release.
- No product feature changes, backend architecture rewrites, frontend architecture rewrites, or API contract changes.
- No ESLint migration unless a blocker proves Oxlint alone cannot satisfy the lightweight linting requirement.
- No replacement of TypeScript type checking with Oxlint.
- No new E2E browser test suite unless one already exists and only needs to be wired into CI.
- No advanced monorepo tooling unless the existing repository structure already supports it cleanly.

## Decisions

### Use Oxlint directly in each app

Add `oxlint` as a dev dependency in `/backend` and `/frontend`, and expose it through each app's `lint` script. This keeps linting local to each npm project and avoids introducing a root workspace manager for a small technical test.

Alternative considered: add ESLint or a combined ESLint/Oxlint setup. That would add more configuration and dependency surface than needed for this scope.

### Rename or add typecheck/build scripts instead of overloading lint

Backend currently uses `lint` for `tsc --noEmit`. The implementation should preserve type safety by moving or duplicating that command into an explicit `typecheck` script and making `lint` run Oxlint. The existing `build` script remains the compile check.

Alternative considered: keep backend `lint` as TypeScript no-emit and add `lint:oxlint`. That would violate the stated expectation that Oxlint/Oxc linting is the lint command and would keep reviewer commands less consistent.

### Prefer no root package unless it remains lightweight

Because the repository has independent `/backend` and `/frontend` package files and no root package today, the implementation should first evaluate whether a minimal root `package.json` with scripts such as `lint`, `lint:backend`, and `lint:frontend` improves usability. If added, it should not introduce workspaces or unrelated dependencies unless necessary.

Alternative considered: always add npm workspaces at the root. This is unnecessary for the existing timeboxed submission and could change dependency-management expectations.

### Use one CI workflow with separated backend and frontend jobs or sections

The workflow should live at `.github/workflows/ci.yml`, trigger on `push` and `pull_request`, and use a stable Node.js version compatible with the README and installed types. The current repository targets Node.js 22+, so CI should use Node 22 unless implementation discovers a lockfile/runtime compatibility issue.

Backend and frontend checks should be clearly separated, either as separate jobs or separate named steps. Separate jobs are preferred for clarity and faster failure isolation; a shared setup pattern is acceptable if it remains readable.

### Use npm lockfile-aware installs and setup-node caching

The repository currently uses npm lockfiles in both `/backend` and `/frontend`, so CI should use `npm ci` in each directory. Dependency caching should use `actions/setup-node` with `cache: npm` and the matching package-lock paths where practical.

Alternative considered: switch to pnpm or yarn. Changing package managers is outside scope.

## Risks / Trade-offs

- **Oxlint may report issues in existing code immediately** → Fix only lint violations required to make the new checks pass; avoid broad refactors or product behavior changes.
- **Backend tests require MongoDB** → CI must provide MongoDB via a service container or documented equivalent before running backend tests.
- **Root scripts could imply a monorepo setup that does not exist** → Add only minimal root scripts if useful; otherwise document per-app commands.
- **Frontend tests already exist now, but future proposals mention conditional test execution** → CI should run `npm test` because the current frontend has tests; if implementation discovers no tests, use a safe conditional path rather than failing due to missing scripts.
- **Build warnings may appear, especially frontend bundle-size warnings** → CI should treat successful exit codes as pass and document known warnings only if reviewer-facing.
