# Link Arch

Link Arch is a fast, lightweight link management platform built with Bun, Elysia, and Next.js. It supports authenticated URL shortening, custom aliases, click tracking, URL lifecycle management, and auto-generated OpenAPI docs.

## Features

- Authenticated link management with email/password authentication (Better Auth)
- Create short URLs with custom keys or generated aliases
- URL reachability validation before creating or updating links
- Link administration: update destination, update key, toggle active status, set expiry date, and soft delete
- Redirect and non-redirect preview (`/:key/peek`) endpoints
- Dashboard and My Links UI with search, filtering, sorting, pagination, and CSV export
- OpenAPI documentation generated directly from route schemas

## Tech Stack

### Backend

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Elysia](https://elysiajs.com)
- **Auth:** [Better Auth](https://www.better-auth.com)
- **Database:** PostgreSQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team) (with [postgres.js](https://github.com/porsager/postgres) driver)

### Frontend

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com) v4
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query) v5
- **Theming:** [next-themes](https://github.com/pacocoursey/next-themes) (system, light, dark)
- **Notifications:** [Sonner](https://sonner.emilkowal.dev)

### Tooling

- **Monorepo:** [Turborepo](https://turbo.build)
- **Linter/Formatter:** [Biome](https://biomejs.dev)
- **Load Testing:** [k6](https://k6.io)

## Prerequisites

- [Bun](https://bun.sh) v1.2.0+
- [PostgreSQL](https://www.postgresql.org) running locally or remotely
- [k6](https://k6.io) (optional, for load testing)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/carvalhocaio/link-arch.git
cd link-arch
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Set values in `.env`:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by API and migrations | _(required)_ |
| `PORT` | API server listen port | `3000` |
| `BASE_URL` | Public API base URL used to build short links | `http://localhost:3000` |
| `WEB_URL` | Allowed web origin for CORS and trusted auth origins | `http://localhost:3001` |
| `FORWARD_TIMEOUT_MS` | Timeout in milliseconds for URL reachability checks | `5000` |
| `BETTER_AUTH_SECRET` | Better Auth signing secret | _(required)_ |
| `NEXT_PUBLIC_API_URL` | API base URL consumed by the Next.js app | `http://localhost:3000` |

### 4. Run database migrations

```bash
bun run db:generate
bun run db:migrate
```

### 5. Start development

```bash
bun run dev
```

By default:

- API: `http://localhost:3000`
- Web: `http://localhost:3001`

You can also run only one app:

```bash
bun run dev:api
bun run dev:web
```

## Available Scripts

Run all commands from the monorepo root with `bun run <script>`.

| Script | Description |
|---|---|
| `dev` | Start all apps in development mode |
| `dev:api` | Start only the API app |
| `dev:web` | Start only the web app |
| `build` | Build all apps and packages |
| `lint` | Run lint tasks in workspaces |
| `check` | Run Biome checks in workspaces |
| `test` | Run test tasks in workspaces |
| `format` | Format repository files with Biome |
| `db:generate` | Generate Drizzle migration files |
| `db:migrate` | Apply pending migrations |

## Project Structure

This repository is a Turborepo monorepo:

- `apps/api` - Elysia API (shorten, redirect, auth, admin, OpenAPI)
- `apps/web` - Next.js frontend (dashboard, my-links, auth pages)
- `packages/db` - Shared Drizzle schema, auth schema, and migration scripts
- `packages/biome-config` - Shared Biome configuration
- `packages/tsconfig` - Shared TypeScript configuration

## API Overview

Common routes include:

- `GET /health` - Health and metadata
- `POST /api/auth/sign-up` - Create account
- `POST /api/auth/sign-in` - Sign in
- `POST /api/shorten` - Create short URL (authenticated)
- `GET /:key` - Redirect to target URL
- `GET /:key/peek` - Preview URL metadata without redirect
- `GET /api/admin/urls` - List current user URLs (authenticated)
- `PATCH /api/admin/urls/:id` - Update destination URL and expiry (authenticated)
- `PATCH /api/admin/urls/:id/key` - Update short key (authenticated)
- `PATCH /api/admin/urls/:id/status` - Activate/deactivate link (authenticated)
- `DELETE /api/admin/urls/:id` - Soft delete link (authenticated)

## API Documentation

The API is fully documented via auto-generated OpenAPI.

Once the API is running:

```http
GET /openapi
```

You can import this spec into tools like [Swagger UI](https://swagger.io/tools/swagger-ui/) or [Scalar](https://scalar.com).

## Load Testing

A [k6](https://k6.io) script is included to benchmark API latency under load.

### Run the benchmark

Make sure the API server is running:

```bash
k6 run apps/api/k6/latency.js
```

Target a different host:

```bash
k6 run -e BASE_URL=http://your-host:3000 apps/api/k6/latency.js
```

### Scenario details

- Ramps up to **50 virtual users** over 10 seconds
- Sustains 50 virtual users for 20 seconds, then ramps down over 10 seconds
- Each iteration creates a short URL, peeks it, and follows redirect
- Threshold: p95 response time under **200ms**
