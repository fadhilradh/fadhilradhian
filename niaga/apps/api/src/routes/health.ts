import { healthResponseSchema } from '@niaga/contracts';
import { sql } from '@niaga/db';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const startedAt = Date.now();

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/healthz',
    {
      // Fly.io hits this every few seconds; rate limiting it would be silly.
      config: { rateLimit: false },
      schema: {
        tags: ['meta'],
        summary: 'Liveness and dependency check',
        response: { 200: healthResponseSchema },
      },
    },
    async () => {
      let database: 'ok' | 'unreachable' | 'not_configured' = 'not_configured';

      if (app.db) {
        try {
          await app.db.execute(sql`select 1`);
          database = 'ok';
        } catch (error) {
          app.log.error({ err: error }, 'database health check failed');
          database = 'unreachable';
        }
      }

      return {
        status: database === 'unreachable' ? ('degraded' as const) : ('ok' as const),
        version: process.env.NIAGA_VERSION ?? '0.0.0',
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        checks: { database },
      };
    },
  );
};
