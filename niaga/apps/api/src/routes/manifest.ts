import { listingSummarySchema, localeSchema, manifestResponseSchema } from '@niaga/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { readManifest, readRecentListings } from '../lib/manifest-source.js';

export const manifestRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/v1/manifest',
    {
      schema: {
        tags: ['listings'],
        summary: 'Latest active listings, formatted for the manifest board',
        querystring: z.object({
          locale: localeSchema.default('id'),
          limit: z.coerce.number().int().min(1).max(30).default(8),
        }),
        response: { 200: manifestResponseSchema },
      },
    },
    async (request) => {
      const { locale, limit } = request.query;
      return readManifest(app.db, locale, limit);
    },
  );

  app.get(
    '/v1/listings/recent',
    {
      schema: {
        tags: ['listings'],
        summary: 'Newest active listings',
        description:
          'Superseded in phase 3 by the faceted, keyset-paginated GET /v1/listings. Kept narrow deliberately: no filters, no cursor.',
        querystring: z.object({
          limit: z.coerce.number().int().min(1).max(48).default(12),
        }),
        response: { 200: z.object({ items: z.array(listingSummarySchema) }) },
      },
    },
    async (request) => ({ items: await readRecentListings(app.db, request.query.limit) }),
  );
};
