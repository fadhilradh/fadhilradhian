# Built from the monorepo root: docker build -f apps/worker/Dockerfile .
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

RUN pnpm --filter @niaga/worker build

ENV NODE_ENV=production

CMD ["node", "apps/worker/dist/index.js"]
