import { z } from 'zod';

/**
 * Domain vocabulary. These arrays are the single source of truth: the Drizzle
 * enums, the Zod validators and the UI option lists all read from here, so a
 * new incoterm is a one-line change plus a migration.
 */

/**
 * Indonesian customs risk lanes (jalur hijau / kuning / merah), reused as the
 * verification status system. See DECISIONS.md §5.
 *
 * - green  — NIB + NPWP + API document all verified
 * - amber  — some documents verified, some missing or expired
 * - red    — nothing verified. Shown, never hidden.
 */
export const LANES = ['green', 'amber', 'red'] as const;
export const laneSchema = z.enum(LANES);
export type Lane = z.infer<typeof laneSchema>;

export const LISTING_KINDS = ['offer', 'request'] as const;
export const listingKindSchema = z.enum(LISTING_KINDS);
export type ListingKind = z.infer<typeof listingKindSchema>;

export const LISTING_STATUSES = ['draft', 'active', 'paused', 'expired', 'removed'] as const;
export const listingStatusSchema = z.enum(LISTING_STATUSES);
export type ListingStatus = z.infer<typeof listingStatusSchema>;

export const UNITS = ['KG', 'MT', 'TEU', 'CBM', 'PCS', 'LITER'] as const;
export const unitSchema = z.enum(UNITS);
export type Unit = z.infer<typeof unitSchema>;

export const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DDP'] as const;
export const incotermSchema = z.enum(INCOTERMS);
export type Incoterm = z.infer<typeof incotermSchema>;

export const CURRENCIES = ['IDR', 'USD'] as const;
export const currencySchema = z.enum(CURRENCIES);
export type Currency = z.infer<typeof currencySchema>;

export const ENTITY_TYPES = ['PT', 'CV', 'UD', 'Koperasi', 'Perorangan'] as const;
export const entityTypeSchema = z.enum(ENTITY_TYPES);
export type EntityType = z.infer<typeof entityTypeSchema>;

/** API-U = general importer, API-P = producer importer. Exporters may have neither. */
export const API_TYPES = ['API-U', 'API-P'] as const;
export const apiTypeSchema = z.enum(API_TYPES);
export type ApiType = z.infer<typeof apiTypeSchema>;

export const LOCALES = ['id', 'en'] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

/**
 * Certifications that matter in agri-commodity export (the launch vertical).
 * Widening the vertical means appending here, not restructuring.
 */
export const CERTIFICATIONS = [
  'HACCP',
  'ISO 22000',
  'Halal MUI',
  'Organic',
  'Rainforest Alliance',
  'Fair Trade',
  'GlobalG.A.P.',
  'SVLK',
  'FSC',
] as const;
export const certificationSchema = z.enum(CERTIFICATIONS);
export type Certification = z.infer<typeof certificationSchema>;

export const DOCUMENT_KINDS = ['nib', 'npwp', 'api', 'customs_nik', 'akta', 'other'] as const;
export const documentKindSchema = z.enum(DOCUMENT_KINDS);
export type DocumentKind = z.infer<typeof documentKindSchema>;

export const INQUIRY_STATUSES = ['open', 'accepted', 'quoted', 'closed'] as const;
export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
