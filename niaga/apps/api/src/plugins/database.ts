import { createDatabase, type Database } from '@niaga/db';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyInstance {
    /** Null when DATABASE_URL is unset — routes fall back to seed fixtures. */
    db: Database | null;
  }
}

/**
 * Decorates the instance with a Drizzle client, or null when no database is
 * configured. Nullable rather than fatal so phase 0 runs before Neon exists;
 * `/healthz` reports `not_configured` so the state is never silent.
 */
async function databasePlugin(app: FastifyInstance) {
  if (!env.DATABASE_URL) {
    app.log.warn('DATABASE_URL is not set — serving seed fixtures instead of live data');
    app.decorate('db', null);
    return;
  }

  const db = createDatabase({ url: env.DATABASE_URL });
  app.decorate('db', db);

  app.addHook('onClose', async () => {
    await db.$client.end({ timeout: 5 });
  });
}

export default fp(databasePlugin, { name: 'database' });
