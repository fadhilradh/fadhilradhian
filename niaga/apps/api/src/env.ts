import { config } from 'dotenv';
import { z } from 'zod';

// One .env at the monorepo root. In production every value comes from Fly.io
// secrets and this call is a no-op.
config({ path: new URL('../../../.env', import.meta.url).pathname, quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  /**
   * Optional on purpose: with no database the API serves the seed fixtures, so
   * `pnpm dev` shows a working manifest board before Neon is provisioned.
   */
  DATABASE_URL: z.string().url().optional(),

  /** Comma-separated. Must include the Netlify origin in production. */
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  PUBLIC_WEB_URL: z.string().url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: parsed.data.NODE_ENV === 'production',
};

export type Env = typeof env;
