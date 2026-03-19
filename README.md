# Link Arch

A fast, lightweight link management platform built with Bun, Elysia, and Next.js. It generates short links, tracks click counts, validates target URL reachability, and exposes auto-generated OpenAPI documentation. Includes a web frontend with dark mode support.

## Tech Stack

### Backend

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Elysia](https://elysiajs.com)
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

Open `.env` and set the values:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | _(required)_ |
| `PORT` | Server listen port | `3000` |
| `BASE_URL` | Public-facing base URL for generated short links | `http://localhost:3000` |
| `FORWARD_TIMEOUT_MS` | Timeout (ms) for the URL reachability check | `5000` |

### 4. Run database migrations

```bash
bun run db:generate
bun run db:migrate
```

### 5. Start the development server

```bash
bun run dev
```

The API will be available at `http://localhost:3000` and the web frontend at `http://localhost:3001`.

## Available Scripts

All scripts are run from the monorepo root with `bun run <script>`.

| Script | Description |
|---|---|
| `dev` | Start all apps in development mode (with hot reload) |
| `dev:api` | Start only the API app in development mode |
| `dev:web` | Start only the web frontend in development mode |
| `build` | Build all apps and packages |
| `lint` | Run Biome linter across the monorepo |
| `check` | Run Biome checks across the monorepo |
| `test` | Run tests across all workspaces |
| `format` | Format all files with Biome |
| `db:generate` | Generate Drizzle migration files from schema changes |
| `db:migrate` | Apply pending database migrations |

## Project Structure

This is a Turborepo monorepo:

- **`apps/api`** -- The Elysia-based Link Arch API
- **`apps/web`** -- The Next.js web frontend (shadcn/ui, React Query, next-themes)
- **`packages/db`** -- Shared database schema, migrations, and type exports (Drizzle ORM)
- **`packages/biome-config`** -- Shared Biome linter/formatter configuration
- **`packages/tsconfig`** -- Shared TypeScript configuration

## API Documentation

The API is fully documented via an auto-generated OpenAPI specification. Once the server is running, access the spec at:

```
GET /openapi
```

You can use tools like [Swagger UI](https://swagger.io/tools/swagger-ui/), [Scalar](https://scalar.com), or import the spec into any OpenAPI-compatible client to explore available endpoints, request/response schemas, and try out requests interactively.

## Load Testing

A [k6](https://k6.io) load test script is included to benchmark API latency under load.

### Install k6

Follow the [official installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/) for your platform.

### Run the benchmark

Make sure the API server is running, then:

```bash
k6 run apps/api/k6/latency.js
```

To target a different host:

```bash
k6 run -e BASE_URL=http://your-host:3000 apps/api/k6/latency.js
```

### What it tests

- Ramps up to **50 virtual users** over 10 seconds
- Sustains 50 VUs for 20 seconds, then ramps down over 10 seconds
- Each iteration creates a short URL, peeks at it, and follows the redirect
- **Threshold:** p95 response time must be under **200ms**
