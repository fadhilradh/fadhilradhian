import { z } from 'zod';

/**
 * One error shape for the whole API. `code` is stable and machine-readable;
 * `message` is human-facing and already localised by the API using the
 * request's Accept-Language. `fields` carries per-field validation messages so
 * the client can attach them to inputs without parsing prose.
 */
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
    requestId: z.string().optional(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const ERROR_CODES = {
  badRequest: 'bad_request',
  validationFailed: 'validation_failed',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not_found',
  conflict: 'conflict',
  rateLimited: 'rate_limited',
  internal: 'internal_error',
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
