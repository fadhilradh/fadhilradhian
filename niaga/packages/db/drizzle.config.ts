import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Env lives at the monorepo root so every app reads one file.
config({ path: '../../.env', quiet: true });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Migrations run over the unpooled endpoint: DDL and a pgBouncer-style
    // pooler do not mix.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
