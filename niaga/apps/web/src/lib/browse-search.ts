import { listingListQuerySchema } from '@niaga/contracts';
import type { z } from 'zod';

/**
 * Browse filters live in the URL, not in component state.
 *
 * That is the whole reason TanStack Router is here: a filtered feed is a
 * shareable link, and a shareable link is what a trader pastes into WhatsApp.
 * The shape is picked straight out of the API's own query contract, so the
 * client cannot ask for a filter the server does not accept.
 *
 * `.partial()` keeps the URL clean — an unset filter is an absent param rather
 * than an explicit default.
 */
export const browseSearchSchema = listingListQuerySchema
  .pick({ q: true, kind: true, lane: true, incoterm: true, province: true })
  .partial();

export type BrowseSearch = z.infer<typeof browseSearchSchema>;

/** Every filter key, so "clear" can't miss one when a filter is added. */
export const BROWSE_FILTER_KEYS = ['q', 'kind', 'lane', 'incoterm', 'province'] as const;

export const CLEARED_FILTERS: Record<(typeof BROWSE_FILTER_KEYS)[number], undefined> = {
  q: undefined,
  kind: undefined,
  lane: undefined,
  incoterm: undefined,
  province: undefined,
};
