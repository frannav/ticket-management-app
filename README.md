# thinkIN Ticket Management App

Full-stack technical-test submission for a simplified hotel contact-center ticket manager. The repository contains:

- `/backend` — Node.js + TypeScript + Express API for ticket CRUD, filtering, pagination, validation, soft delete, and consistent errors.
- `/frontend` — Vue 3 + TypeScript + Vuetify UI for listing, filtering, creating, and editing tickets.
- `docker-compose.yml` — local MongoDB infrastructure and an optional backend container path.

The default reviewer workflow uses Docker Compose for MongoDB and local `npm` commands for the backend and frontend.

## Tech stack

| Area | Stack |
| --- | --- |
| Backend | Node.js 22, TypeScript, Express, Mongoose, Zod, Morgan |
| Frontend | Vue 3, TypeScript, Vite, Vuetify |
| Database | MongoDB 7 |
| Testing | Vitest, Supertest, Vue Test Utils, happy-dom |
| Local infrastructure | Docker Compose for MongoDB and optional backend container build |

## Prerequisites

- Node.js 22+
- npm
- Docker Desktop or Docker Engine with Docker Compose

## Local setup

From a clean checkout:

```bash
# 1) Start MongoDB
docker compose up -d mongodb

# 2) Install backend dependencies
cd backend
npm ci
cp .env.example .env

# 3) Install frontend dependencies
cd ../frontend
npm ci
cp .env.example .env
```

## Run the app locally

Use three terminals:

```bash
# Terminal 1: MongoDB from the repository root
docker compose up -d mongodb
docker compose ps mongodb
```

```bash
# Terminal 2: backend API
cd backend
npm run dev
```

```bash
# Terminal 3: frontend UI
cd frontend
npm run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:3001/health`
- Ticket API base path: `http://localhost:3001/api/v1/tickets`

During Vite development, the frontend leaves `VITE_API_BASE_URL` empty and uses the Vite `/api` proxy to `http://localhost:3001`.

### Seed demo tickets

To load persistent demo tickets for reviewing pagination and filters:

```bash
cd backend
MONGODB_URI=mongodb://127.0.0.1:27017/thinkin_tickets npm run seed
```

The seed is idempotent and inserts 45 `[Demo NN]` tickets only once. They persist in the MongoDB Docker volume until the volume is removed.

## Environment variables

### Backend

| Variable | Example | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime mode (`development`, `test`, or `production`). |
| `PORT` | `3001` | Backend HTTP port. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/thinkin_tickets` | Local backend connection string from the host to Compose MongoDB. |
| `MONGODB_TEST_URI` | `mongodb://127.0.0.1:27017/thinkin_tickets_test` | Isolated database used by backend integration tests. |

In Docker Compose, the backend service uses the container-network URI `mongodb://mongodb:27017/thinkin_tickets`.

### Frontend

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | empty locally | Backend origin. Leave empty for local Vite proxying; set a full API origin for a deployed frontend when CORS or same-origin routing is configured. |

## Tests and builds

Commands verified during the delivery-readiness pass:

```bash
# Backend tests: MongoDB must be running
docker compose up -d mongodb
cd backend
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/thinkin_tickets_test npm test

# Backend typecheck/build
npm run build
```

```bash
# Frontend behavior/API tests
cd frontend
npm test

# Frontend typecheck/build
npm run build
```

`npm run build` in the frontend currently emits Vite's standard large-chunk warning because Vuetify and Material Design Icons are bundled for this small technical-test UI. The build succeeds.

## Quality checks and CI

Linting uses Oxlint separately from TypeScript/Vue type checking:

```bash
# Run both app lint commands from the repository root
npm run lint

# Or run each app independently
cd backend
npm run lint
npm test
npm run build

cd ../frontend
npm run lint
npm test
npm run build
```

Backend tests require MongoDB, for example `docker compose up -d mongodb` with `MONGODB_TEST_URI=mongodb://127.0.0.1:27017/thinkin_tickets_test`. GitHub Actions CI runs equivalent backend and frontend verification on `push` and `pull_request`: `npm ci`, Oxlint, tests, and build checks.

## Docker Compose

MongoDB is the default Compose dependency:

```bash
docker compose up -d mongodb
docker compose ps mongodb
```

Configuration:

- Port: `27017:27017`
- Database name initialized for local development: `thinkin_tickets`
- Persistent volume: `mongodb_data`
- Health check: `mongosh --eval "db.adminCommand('ping').ok"`

Optional backend container verification:

```bash
docker compose --profile app build backend
docker compose --profile app up -d backend
```

The frontend is intentionally not included as a Compose service. For review and development, `npm run dev` keeps Vite fast, transparent, and aligned with the required `VITE_API_BASE_URL`/proxy behavior.

## TDD-oriented approach

- Backend endpoint behavior is covered with Vitest + Supertest integration tests against MongoDB for create, list/filter/pagination, retrieve, update, soft delete, validation, and standard error responses.
- Frontend behavior tests cover the ticket API client, list view states, filtering, pagination, creation, editing, validation, and error/empty/loading states.
- Delivery checks were run before and after documentation updates so the README commands match the repository scripts.

## Technical decisions

- **Express + Mongoose + Zod:** Lightweight stack that keeps the API explicit, validates input at the boundary, and maps naturally to MongoDB documents.
- **Soft delete:** `DELETE` sets `deleted_at` so ticket history can be retained while normal reads exclude deleted tickets.
- **Consistent error shape:** Validation, not-found, and unexpected errors return stable JSON without leaking stack traces.
- **Vue + Vuetify without extra global state:** The UI is small enough for local component state and API-client helpers; adding Pinia would be unnecessary ceremony for this scope.
- **Docker Compose for infrastructure, local npm for apps:** Compose makes MongoDB reproducible while local app commands are faster for reviewers to inspect and debug.
- **Frontend same-origin default:** Empty `VITE_API_BASE_URL` uses the Vite proxy locally and can be replaced with a deployed API origin later.

## Known limitations

- No authentication, authorization, tenant isolation, or role model.
- No production CORS policy; local development uses the Vite proxy.
- Logging is minimal request/error logging rather than structured observability.
- Search is simple text matching suitable for the timebox, not a tuned search system.
- Frontend bundle splitting has not been optimized; the production build succeeds with a chunk-size warning.
- CI is intentionally limited to install/lint/test/build verification; it does not deploy or publish artifacts.

## Production readiness

For production I would add authentication/authorization with tenant scoping, reviewed CORS or same-origin deployment, structured logs/metrics/tracing, expanded CI/security gates, rate limits and request-size limits, backups and migration strategy, stronger indexes, deployment health/readiness probes, and frontend error monitoring. I would also separate runtime secrets from example env files and define operational runbooks for incident response and data recovery.

## AI usage declaration

AI assistance was used to accelerate implementation planning, code generation, tests, documentation, and delivery-readiness review. I reviewed and verified the generated work, ran the documented checks, and kept the final technical decisions and trade-offs explicit so they can be defended in a live review.

## Scalability: from 1,000 to 100,000 tickets/day

1. **Add targeted MongoDB indexes and query monitoring.** Index common filters (`hotel_id`, `status`, `priority`, `assigned_to`, `created_at`, `deleted_at`) and review slow queries so list/search endpoints stay predictable as data grows.
2. **Move text search and heavy reads off the primary path.** Use MongoDB Atlas Search or a search service for `q`, plus read replicas/caching for frequent dashboards, reducing load on transactional writes.
3. **Harden the API runtime for horizontal scale.** Run multiple stateless backend instances behind a load balancer, add rate limits, queues for slow side effects, and metrics/alerts to catch saturation before agents feel it.

## Final verification summary

The delivery-readiness implementation verified dependency installation, MongoDB through Docker Compose, backend tests/build, backend Docker build, frontend tests/build, and README command alignment. Remaining limitations are documented above rather than hidden behind unnecessary infrastructure.
