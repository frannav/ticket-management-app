## CI/lint verification checklist

- Package manager: backend and frontend are independent npm projects with committed `package-lock.json` files; local and CI installs should use `npm ci`.
- Backend scripts before implementation: `lint` currently runs `tsc --noEmit -p tsconfig.json`, `test` runs `vitest run`, and `build` runs `tsc -p tsconfig.json`. The backend `lint` script must become Oxlint, while TypeScript checking remains available through a separate `typecheck` script and `build`.
- Frontend scripts before implementation: `test`, `typecheck`, and `build` already exist, but no `lint` script exists. Add frontend Oxlint while preserving Vue/TypeScript typecheck and build scripts separately.
- Backend tests require MongoDB: Vitest setup uses `MONGODB_TEST_URI` when provided, otherwise `mongodb://127.0.0.1:27017/thinkin_tickets_test`. CI must provide a reachable MongoDB service before `npm test`.
- Expected local/CI checks: backend `npm ci`, `npm run lint`, `npm test`, `npm run build`; frontend `npm ci`, `npm run lint`, `npm test`, `npm run build`.
- Scope boundaries: keep the workflow limited to install, lint, test, build/typecheck; do not add deployment, Docker image publishing, release automation, product behavior changes, or advanced monorepo tooling.

## Final verification results

- `npm ci` passed in `/backend` and `/frontend`.
- `npm run lint` passed from the repository root, delegating to backend and frontend Oxlint. Frontend Oxlint emitted warnings only (existing Vitest mock typing/conditional expects and a spread fallback warning), with exit code 0.
- Backend tests passed with `MONGODB_TEST_URI=mongodb://127.0.0.1:27017/thinkin_tickets_test` and Docker MongoDB running. The sandboxed run could not connect to `127.0.0.1:27017` (`EPERM`), so the final successful verification used approved local-network access.
- Frontend tests passed.
- Backend `npm run build` passed.
- Frontend `npm run build` passed and retained the known Vite large-chunk warning.
- `openspec status --change quality-tooling-ci --json` reports the spec-driven artifacts complete and ready for review.
- Review note: this implementation changed quality tooling, CI, lockfiles, README documentation, and OpenSpec notes/tasks only. Existing unrelated uncommitted frontend/OpenSpec changes were present in the working tree and were not introduced by this quality-tooling implementation.
