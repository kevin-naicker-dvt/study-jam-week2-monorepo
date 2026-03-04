# Study Jam Week 2 – Monorepo

3-tier app: **React** (UX) + **NestJS** (backend) + **Drizzle** (ORM) + **PostgreSQL**, with Docker and GCP Cloud Build / Cloud Run.

## Stack

- **UX:** React (Vite)
- **Backend:** NestJS
- **ORM:** Drizzle
- **Database:** PostgreSQL
- **Containers:** Docker
- **CI:** GCP Cloud Build
- **CD:** GCP Cloud Run (use GCP-created domains per guardrails)

## Use cases

1. **Register** – Name, Surname, Email, Password
2. **Login** – Access Granted / Access Denied

## Local development

### Prerequisites

- Node 20+
- Docker (for PostgreSQL)

### 1. Install and run DB + API

```bash
# From repo root
npm install
cd apps/api && npx drizzle-kit generate  # optional, migrations already in repo
cd ../..

# Start PostgreSQL and API in Docker
docker compose up -d postgres
# Wait for Postgres, then run API locally (so you can use existing migrations folder path)
cd apps/api && npm run dev
# Or run API in Docker too:
# docker compose up --build
```

### 2. Run the web app

```bash
npm run dev:web
```

Open http://localhost:5173. Use **Register** then **Login**. The app proxies `/api` to the API (port 3000).

### 3. Database URL

Default: `postgresql://postgres:postgres@localhost:5432/postgres`. Override with `DATABASE_URL` for the API.

**Guardrail (demo):** PostgreSQL is in Docker with port 5432 exposed for easy access.

## Build and deploy

### Build (CI – GCP Cloud Build)

From repo root:

```bash
npm ci
npm run build
```

Cloud Build: use `cloudbuild.yaml`. Set substitutions for your project (e.g. `_API_IMAGE`, `_WEB_IMAGE`, `_API_URL` for the web app). Build step runs `npm ci` and `npm run build` for the monorepo, then builds API and Web Docker images.

### Deploy (CD – Cloud Run)

- Deploy the **API** image to Cloud Run; set `DATABASE_URL` to your Postgres instance (e.g. Cloud SQL or the same Postgres used in demo).
- Deploy the **Web** image to Cloud Run (or static hosting); set `VITE_API_URL` at build time to the API Cloud Run URL so the frontend calls the correct backend.
- Use **GCP-created domains** for both services (per guardrails).

## Testing

- **Unit tests:** None for now.
- **Build and deployment check:** Yes – run `npm run build` (and optionally `docker compose build` or Cloud Build) to verify.

## Structure

```
apps/
  api/          NestJS + Drizzle, POST /auth/register, POST /auth/login
  web/          React (Vite), Register + Login UI
docker-compose.yml   Postgres + API (optional)
cloudbuild.yaml      GCP Cloud Build
```
