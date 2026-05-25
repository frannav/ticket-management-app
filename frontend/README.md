# Ticket Management Frontend

Vue 3 + TypeScript + Vite frontend for the ticket management API.

## Environment

Copy the example environment file and point the UI at the backend API:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend origin. Leave empty during local Vite development to use the built-in `/api` proxy to `http://localhost:3001`, or set a full backend origin when the deployed API is CORS-enabled. The frontend appends `/api/v1/tickets`. |

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
