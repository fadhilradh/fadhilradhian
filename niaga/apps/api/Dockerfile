# Built from the monorepo root: docker build -f apps/api/Dockerfile .
#
# Single stage on purpose. tsup bundles the workspace packages into dist, so the
# runtime only needs the external deps that are already installed here. Slimming
# this to a two-stage image is a phase-6 concern, not a phase-0 one.
FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/worker/package.json ./apps/worker/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @niaga/api build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "apps/api/dist/server.js"]
