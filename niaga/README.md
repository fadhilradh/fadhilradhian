# Niaga — phase 0

Verified Indonesian import/export marketplace. This directory is a self-contained
monorepo; the repository root is a separate personal site and is untouched.

The five open questions from the plan are answered in [DECISIONS.md](./DECISIONS.md).
Short version: agri-commodities first, foreign buyers are a launch target, manual
document review at MVP, in-app messaging with a gated WhatsApp handoff, and the
port-and-paperwork design direction is built rather than re-pitched.

## What phase 0 contains

| Area                                                                                   | State      |
| -------------------------------------------------------------------------------------- | ---------- |
| pnpm workspace + Turborepo, shared tsconfig/eslint                                     | done       |
| Design tokens, the customs-lane palette, three type faces, dark/light                  | done       |
| `packages/contracts` — Zod schemas shared by both sides                                | done       |
| `packages/db` — full Drizzle schema, extensions bootstrap, idempotent seed             | done       |
| `apps/api` — Fastify 5 + Zod type provider, `/healthz`, manifest, OpenAPI at `/docs`   | done       |
| `apps/worker` — pg-boss boot, queue registry, listing-expiry sweep                     | done       |
| `apps/web` — landing page with the live manifest board, browse with URL-synced filters | done       |
| Deploy config — Netlify (web), Fly.io `sin` (api + worker)                             | done       |
| Better Auth, listings CRUD, R2 uploads, faceted search in Postgres                     | phases 1–3 |

## Running it

```sh
cd niaga
pnpm install
cp .env.example .env     # optional for the web app; required for db + worker
pnpm dev
```

`pnpm dev` starts the API on `:3001` and the web app on `:5173`.

**No database needed to look at it.** With `DATABASE_URL` unset the API serves the
seed fixtures from `packages/db/src/fixtures.ts`, so the manifest board and the
listing cards render on a clean checkout. `/healthz` reports
`database: not_configured` so the state is never silent.

### With a database

```sh
# 1. Create a Neon project in ap-southeast-1, put both URLs in .env
# 2. Extensions + immutable_unaccent, then migrations, then seed
pnpm db:generate     # writes SQL into packages/db/migrations
pnpm db:migrate      # runs src/bootstrap.ts, then drizzle-kit migrate
pnpm db:seed
```

`db:migrate` runs the bootstrap first on purpose: the generated `search_vector`
column calls `immutable_unaccent`, and stock `unaccent` is only STABLE, which
Postgres refuses inside a generated column.

The worker needs a database — its queue _is_ the database:

```sh
pnpm --filter @niaga/worker dev
```

## Deploying

**web → Netlify.** Set the site's _Base directory_ to `niaga`; Netlify then reads
`niaga/netlify.toml`, which sets the build command, the SPA redirect, the CSP and
`VITE_API_URL` per deploy context.

**api + worker → Fly.io, region `sin`.** Both have a `Dockerfile` and a `fly.toml`.
Build from the monorepo root so the workspace resolves:

```sh
fly deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile .
fly secrets set -a niaga-api DATABASE_URL=... CORS_ORIGINS=https://<site>.netlify.app
```

**db → Neon, Singapore.** Same region as the API so the hop stays inside one metro.

## Layout

```
niaga/
├── apps/
│   ├── web/         Vite + React 19 + TanStack Router/Query
│   ├── api/         Fastify 5, Zod type provider, OpenAPI at /docs
│   └── worker/      pg-boss consumers
├── packages/
│   ├── contracts/   Zod schemas → shared types → OpenAPI. One contract.
│   ├── db/          Drizzle schema, migrations, bootstrap, fixtures, seed
│   ├── ui/          Design tokens + primitives
│   └── config/      tsconfig + eslint bases
├── netlify.toml
└── turbo.json
```

## Things worth knowing before you read the code

- **Every enum is declared once** in `packages/contracts/src/enums.ts` and projected
  into Postgres by `packages/db/src/schema/enums.ts`. A validator and a column
  cannot drift.
- **The verification lane is on the company, not the listing.** Cards read it
  through the join, so a lane change is instantly visible everywhere.
- **Keyset pagination only.** `encodeCursor`/`decodeCursor` live in contracts; a
  malformed cursor is page one, not a 500.
- **`pg_trgm` and `unaccent`** are what make "kopi arabika" and "arabica coffee"
  find the same lot. Postgres FTS carries this to roughly 100k listings; there is
  no Elasticsearch, no RabbitMQ, and Redis is reserved for rate limiting.
- **The manifest board is the only animation.** One split-flap reveal on load, a
  slow tick after that, and nothing at all under `prefers-reduced-motion`.
