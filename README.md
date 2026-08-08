# Ava

Ava is a React/Vite speech-to-text interface backed by a Fastify REST API and PostgreSQL. The frontend only talks to the API; Prisma owns database access and migrations.

## Run with Docker

```bash
make setup
```

This creates `.env` from `.env.example` if needed, builds the services, starts them, runs migrations, and creates the idempotent demo user. Open `http://localhost:5173`; the API health check is at `http://localhost:3000/api/health`.

Useful commands:

```bash
make help
make up
make down
make logs
make db-reset # destroys local database data
```

## Architecture

```text
React/Vite (5173) → Fastify REST API (3000) → PostgreSQL
```

`server/prisma/schema.prisma` defines users and persistent transcription records. Transcription input currently creates durable job/history records; connecting an actual speech-recognition provider is intentionally a separate concern.

## Local development

Install the frontend and backend dependencies separately, set environment variables from the two example files, then run Vite and the API in separate terminals:

```bash
npm install
cd server && npm install
```

The API supports `GET /api/health`, list/detail/delete transcription endpoints, plus multipart file and JSON URL creation at `POST /api/transcriptions`. Responses consistently use `{ data, error }`.
