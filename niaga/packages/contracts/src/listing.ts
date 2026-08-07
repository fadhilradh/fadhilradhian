import { z } from 'zod';

import { companySummarySchema } from './company.js';
import {
  certificationSchema,
  currencySchema,
  incotermSchema,
  laneSchema,
  listingKindSchema,
  unitSchema,
} from './enums.js';
import { pageOf, paginationQuerySchema } from './pagination.js';

/** 8-digit BTKI code. Stored without dots; the UI inserts them for display. */
export const hsCodeSchema = z.string().regex(/^\d{8}$/, 'HS code must be 8 digits (BTKI)');

/** UN/LOCODE, e.g. IDJKT (Tanjung Priok), IDBLW (Belawan). */
export const unlocodeSchema = z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}$/);

export const portSchema = z.object({
  unlocode: unlocodeSchema,
  name: z.string(),
  province: z.string(),
  type: z.enum(['sea', 'air', 'dry']),
});
export type Port = z.infer<typeof portSchema>;

export const hsCodeRefSchema = z.object({
  code: hsCodeSchema,
  descriptionId: z.string(),
  descriptionEn: z.string(),
  /**
   * LARTAS = larangan dan pembatasan (prohibitions and restrictions). Surfaced
   * as an informational flag when a listing uses this code — explicitly not
   * customs advice.
   */
  lartas: z
    .object({
      exportPermitRequired: z.boolean().default(false),
      importPermitRequired: z.boolean().default(false),
      quota: z.boolean().default(false),
      note: z.string().optional(),
    })
    .nullable(),
});
export type HsCodeRef = z.infer<typeof hsCodeRefSchema>;

/**
 * The stencilled shipping-mark block on every card reads from these six fields.
 * Kept flat and mono-renderable on purpose.
 */
export const shippingMarkSchema = z.object({
  hsCode: hsCodeSchema,
  originPort: unlocodeSchema.nullable(),
  destinationPort: unlocodeSchema.nullable(),
  incoterm: incotermSchema.nullable(),
  quantity: z.number().nullable(),
  unit: unitSchema.nullable(),
});
export type ShippingMark = z.infer<typeof shippingMarkSchema>;

export const listingSummarySchema = z.object({
  id: z.string(),
  kind: listingKindSchema,
  titleId: z.string(),
  titleEn: z.string().nullable(),
  mark: shippingMarkSchema,
  moq: z.number().nullable(),
  moqUnit: unitSchema.nullable(),
  priceMin: z.number().nullable(),
  priceMax: z.number().nullable(),
  currency: currencySchema.nullable(),
  priceBasis: z.string().nullable(),
  leadTimeDays: z.number().int().nullable(),
  certifications: z.array(certificationSchema),
  coverImageUrl: z.string().nullable(),
  company: companySummarySchema,
  publishedAt: z.string(),
});
export type ListingSummary = z.infer<typeof listingSummarySchema>;

/** One row of the landing-page manifest board. Narrow by design: the board is a
 *  ruled mono table, and shipping fewer fields keeps it cheap to poll. */
export const manifestRowSchema = z.object({
  id: z.string(),
  kind: listingKindSchema,
  hsCode: hsCodeSchema,
  title: z.string(),
  originPort: unlocodeSchema.nullable(),
  incoterm: incotermSchema.nullable(),
  quantity: z.number().nullable(),
  unit: unitSchema.nullable(),
  lane: laneSchema,
  publishedAt: z.string(),
});
export type ManifestRow = z.infer<typeof manifestRowSchema>;

export const manifestResponseSchema = z.object({
  rows: z.array(manifestRowSchema),
  totalActive: z.number().int(),
});
export type ManifestResponse = z.infer<typeof manifestResponseSchema>;

/** Repeated query params (?certifications=A&certifications=B) arrive as a
 *  string when there is exactly one. Normalise before validating. */
const csvArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }, z.array(item).optional());

export const LISTING_SORTS = ['recent', 'quantity_desc', 'price_asc'] as const;
export const listingSortSchema = z.enum(LISTING_SORTS);
export type ListingSort = z.infer<typeof listingSortSchema>;

/**
 * `GET /v1/listings` — the important one. Every filter is a URL search param so
 * a filtered feed is a shareable link, which is exactly what traders paste into
 * WhatsApp. TanStack Router validates the same shape on the client.
 */
export const listingListQuerySchema = paginationQuerySchema.extend({
  q: z.string().max(120).optional(),
  kind: listingKindSchema.optional(),
  hsChapter: z
    .string()
    .regex(/^\d{2}$/)
    .optional(),
  category: z.string().max(64).optional(),
  province: z.string().max(80).optional(),
  port: unlocodeSchema.optional(),
  incoterm: incotermSchema.optional(),
  currency: currencySchema.optional(),
  minQty: z.coerce.number().nonnegative().optional(),
  unit: unitSchema.optional(),
  certifications: csvArray(certificationSchema),
  lane: laneSchema.optional(),
  sort: listingSortSchema.default('recent'),
});
export type ListingListQuery = z.infer<typeof listingListQuerySchema>;

export const listingListResponseSchema = pageOf(listingSummarySchema).extend({
  facets: z.object({
    lanes: z.record(laneSchema, z.number().int()),
    incoterms: z.record(incotermSchema, z.number().int()),
    provinces: z.array(z.object({ province: z.string(), count: z.number().int() })),
  }),
});
export type ListingListResponse = z.infer<typeof listingListResponseSchema>;

/** Formats 09011100 as 0901.11.00 — how HS codes are written on paperwork. */
export function formatHsCode(code: string): string {
  if (!/^\d{8}$/.test(code)) return code;
  return `${code.slice(0, 4)}.${code.slice(4, 6)}.${code.slice(6, 8)}`;
}
