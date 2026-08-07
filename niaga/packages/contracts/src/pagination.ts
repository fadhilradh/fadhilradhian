import { z } from 'zod';

/**
 * Keyset pagination. Never OFFSET — the browse feed is sorted by
 * (published_at DESC, id DESC) and the cursor carries exactly that tuple, so
 * page 40 costs the same as page 1 and rows can't be skipped when a new
 * listing is published mid-scroll.
 */
export const cursorPayloadSchema = z.object({
  publishedAt: z.string(),
  id: z.string(),
});
export type CursorPayload = z.infer<typeof cursorPayloadSchema>;

/**
 * base64url via btoa/atob rather than Buffer: this module is imported by the
 * browser bundle as well as the API, and Vite does not polyfill Buffer.
 */
function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeCursor(payload: CursorPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

/** Returns null for anything unparseable — a bad cursor is page one, not a 500. */
export function decodeCursor(raw: string): CursorPayload | null {
  try {
    const json: unknown = JSON.parse(fromBase64Url(raw));
    const parsed = cursorPayloadSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const cursorSchema = z.string().max(512);

export const paginationQuerySchema = z.object({
  cursor: cursorSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

/** Wraps a page of results. `nextCursor` is null when the feed is exhausted. */
export function pageOf<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
}
