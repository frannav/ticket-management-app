# Ticket API Backend

Node.js + TypeScript + Express API for simplified hotel contact-center ticket management.

## Requirements

- Node.js 22+
- npm
- Docker Desktop / Docker Compose

## Environment

Copy the example file and adjust values if needed:

```bash
cp backend/.env.example backend/.env
```

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode, e.g. `development`, `test`, or `production`. |
| `PORT` | HTTP port. Defaults to `3001` when omitted. |
| `MONGODB_URI` | Required MongoDB connection string for the running API. |
| `MONGODB_TEST_URI` | Isolated MongoDB database used by integration tests. |

The API fails fast on startup when `MONGODB_URI` is missing.

## Local Development

Start MongoDB:

```bash
docker compose up -d mongodb
```

Install dependencies and run the API:

```bash
cd backend
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3001/health
```

## Tests and Build

Integration tests use `MONGODB_TEST_URI` and clean ticket data between tests. Ensure MongoDB is running first:

```bash
docker compose up -d mongodb
cd backend
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/thinkin_tickets_test npm test
npm run build
```

## Docker

Build and run MongoDB plus the backend service:

```bash
docker compose up -d --build backend
```

The backend container receives `MONGODB_URI=mongodb://mongodb:27017/thinkin_tickets` from `docker-compose.yml`.

## API Summary

Base path: `/api/v1/tickets`

- `POST /` creates a ticket.
- `GET /` lists non-deleted tickets with `page`, `page_size`, `hotel_id`, `status`, `priority`, `channel`, `assigned_to`, and `q` filters.
- `GET /:id` retrieves a non-deleted ticket.
- `PATCH /:id` updates mutable ticket fields.
- `DELETE /:id` soft-deletes a ticket by setting `deleted_at`.

Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Production Follow-ups

- Add authentication, authorization, and tenant-level access enforcement.
- Replace console logging with structured request/error logging.
- Add rate limiting and request size limits appropriate for deployment.
- Add observability, deployment health/readiness checks, and CI.
- Revisit text search/indexing strategy for larger datasets.
