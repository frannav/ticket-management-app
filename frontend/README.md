# Ticket Management Frontend

Vue 3 + TypeScript + Vite frontend for the ticket management API.

## Environment

Copy the example environment file and point the UI at the backend API:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend origin. Leave empty during local Vite development to use the built-in `/api` proxy to `http://localhost:3001`, and leave empty in Docker so Nginx proxies same-origin `/api` requests to the backend service. Set a full backend origin only when the deployed API is CORS-enabled. The frontend appends `/api/v1/tickets`. |

## Docker

From the repository root, build and start the complete stack:

```bash
docker compose up -d --build
```

Open `http://localhost:5173`. The frontend container serves the production build with Nginx and proxies `/api` requests to the backend container.

## Local Development

Start the backend API, then run:

```bash
cd frontend
npm install
npm run dev
```

## Tests and Build

```bash
cd frontend
npm test
npm run build
```

## Production Follow-ups

- Serve the frontend and backend behind the same origin or enable a reviewed CORS policy on the backend before deploying separately.
- Add route-level error monitoring and bundle-size optimization if the UI grows beyond this technical-test scope.
