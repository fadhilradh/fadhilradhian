import {
  errorResponseSchema,
  healthResponseSchema,
  listingSummarySchema,
  manifestResponseSchema,
} from '@niaga/contracts';
import { z } from 'zod';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Typed GET.
 *
 * The response is parsed against the same Zod schema the API validates its
 * output with, so a contract drift shows up as a loud client-side error rather
 * than an undefined three components deep.
 */
async function get<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  params?: Record<string, string | number | undefined>,
): Promise<z.output<T>> {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    credentials: 'include',
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(payload);
    throw parsed.success
      ? new ApiError(
          response.status,
          parsed.data.error.code,
          parsed.data.error.message,
          parsed.data.error.fields,
        )
      : new ApiError(response.status, 'unknown', `Request failed with ${response.status}`);
  }

  return schema.parse(payload) as z.output<T>;
}

const recentListingsResponseSchema = z.object({ items: z.array(listingSummarySchema) });

export const api = {
  health: () => get('/healthz', healthResponseSchema),
  manifest: (locale: string, limit = 12) =>
    get('/v1/manifest', manifestResponseSchema, { locale, limit }),
  recentListings: (limit = 12) =>
    get('/v1/listings/recent', recentListingsResponseSchema, { limit }),
};

export const queryKeys = {
  health: ['health'] as const,
  manifest: (locale: string) => ['manifest', locale] as const,
  recentListings: () => ['listings', 'recent'] as const,
};
