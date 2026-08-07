# Deploy runbook — Neon + Fly.io + Netlify

**Why you are running this and not the agent.** The agent sandbox's network policy
permits the npm registry, GitHub and Anthropic, and blocks everything else. `api.fly.io`,
`console.neon.tech` and `api.netlify.com` all fail at the proxy with a 403 on CONNECT, so
the deploy cannot be executed from there no matter what credentials are supplied. Nothing
below needs the agent; it needs about twenty minutes and three free accounts.

## What is already verified, and what is not

Verified against a real Postgres 16 and a clean clone of this branch:

- `pnpm install --frozen-lockfile` succeeds from the committed lockfile — so the Netlify
  and CI installs will not fail on a stale lock.
- `pnpm turbo run build --filter=@niaga/web` — the exact Netlify build command — produces
  `apps/web/dist`.
- `pnpm db:migrate` installs `pg_trgm`, `unaccent` and `immutable_unaccent`, then applies
  all 19 tables and both partial indexes.
- `pnpm db:seed` is idempotent across repeated runs.
- The API reports `database: ok` and serves live rows from Postgres.
- The worker creates the pg-boss schema, registers all five queues and the hourly
  `Asia/Jakarta` schedule, and its expiry sweep flips a backdated listing to `expired`,
  which then disappears from `/v1/manifest`.

**Not verified: the two Dockerfiles.** The sandbox had no Docker daemon. They are
conventional single-stage Node 22 Alpine builds, but treat the first `fly deploy` as the
real test — that is the most likely thing to need a fix, and step 3 says what to look at.

---

## 1. Neon

Create a project in **Singapore (`ap-southeast-1`)** — same metro as the Fly region, so the
API-to-database hop stays local. Database name `niaga`.

Copy both connection strings into `niaga/.env`:

```
DATABASE_URL="postgresql://…-pooler.ap-southeast-1.aws.neon.tech/niaga?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://…ap-southeast-1.aws.neon.tech/niaga?sslmode=require"
```

Both are needed and they are different. DDL and a transaction-mode pooler do not mix, so
migrations use the unpooled endpoint while the running API uses the pooled one.

## 2. Schema and seed

```sh
cd niaga
pnpm install
pnpm db:migrate     # bootstrap.ts (extensions + immutable_unaccent), then drizzle-kit
pnpm db:seed        # 15 ports, 14 HS codes, 6 companies, 10 listings
```

If `db:migrate` fails on `immutable_unaccent`, the bootstrap did not run — check that
`DATABASE_URL_UNPOOLED` is set, because Neon's pooler will reject `CREATE EXTENSION`.

## 3. API to Fly.io

Fly app names are **globally unique**, so `niaga-api` may be taken. If you rename it, read
the header comment in `netlify.toml` first — the hostname appears in four places.

```sh
cd niaga
fly launch --config apps/api/fly.toml --dockerfile apps/api/Dockerfile --no-deploy --copy-config
fly secrets set -a niaga-api \
  DATABASE_URL="<pooled url>" \
  CORS_ORIGINS="http://localhost:5173"       # widened in step 6
fly deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile .
```

The trailing `.` matters: the build context is the monorepo root, because the Dockerfile
copies every workspace `package.json` before installing.

Then:

```sh
curl https://niaga-api.fly.dev/healthz
# {"status":"ok",...,"checks":{"database":"ok"}}
```

`database: not_configured` means the secret did not land. `unreachable` means the
connection string or Neon's IP rules are wrong.

**If the image build fails**, the likely causes in order: a `COPY` path for a workspace
`package.json` that has drifted from the real layout, `--frozen-lockfile` against an
out-of-date lockfile, or a native build needing `libc6-compat` on Alpine. Switching the
base image to `node:22-slim` resolves the third.

## 4. Worker to Fly.io

```sh
fly launch --config apps/worker/fly.toml --dockerfile apps/worker/Dockerfile --no-deploy --copy-config
fly secrets set -a niaga-worker DATABASE_URL="<pooled url>"
fly deploy --config apps/worker/fly.toml --dockerfile apps/worker/Dockerfile .
fly logs -a niaga-worker      # expect: "worker ready" with five queues
```

The worker has no `[http_service]` and no public address on purpose — it takes work from
Postgres. It must not auto-stop, or the scheduled sweep never fires.

## 5. Web to Netlify

New site → this repository → branch `claude/tech-stack-design-plan-yjeova`.

**Set Base directory to `niaga`.** This is the one field that matters: without it Netlify
reads the repository root and builds the Gatsby personal site instead. Build command and
publish directory then come from `niaga/netlify.toml`.

If the Fly app is not named `niaga-api`, update `VITE_API_URL` in all three `[context.*]`
blocks **and** `connect-src` in the CSP header before the first build.

## 6. Close the loop

Netlify gives you the site URL only after the first deploy, so CORS is necessarily a second
pass:

```sh
fly secrets set -a niaga-api \
  CORS_ORIGINS="https://<your-site>.netlify.app,http://localhost:5173" \
  PUBLIC_WEB_URL="https://<your-site>.netlify.app"
```

Setting secrets restarts the machine; no redeploy needed.

## 7. Verify

Open the site and check, in this order:

1. The footer status chip reads **API connected** (green). Red means CORS or CSP — open the
   console; a CSP violation names `connect-src`, a CORS failure names the missing header.
2. The manifest board lists real commodities. If it shows the error state while the footer
   is green, the API is up but `/v1/manifest` is failing — check `fly logs`.
3. Toggle dark mode and reload. It should stay dark with no flash of light.
4. Toggle ID/EN. Commodity titles should switch language.
5. `/telusuri?lane=green&kind=offer` should load pre-filtered from the URL.
6. `https://<api>/docs` should serve the OpenAPI reference.

## Costs

All free tier at this size: Neon 0.5 GB, two Fly `shared-cpu-1x` machines, Netlify
bandwidth. The one thing to watch is Fly keeping the API machine warm — `min_machines_running = 1`
is set deliberately, because a cold start on search reads as broken rather than slow.

## Rotate afterwards

If you pasted a connection string or a Fly token into a chat, rotate it once the deploy is
up. Neon can reset the password on the role, and `fly tokens revoke` handles the other.
