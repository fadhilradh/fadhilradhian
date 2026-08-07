import { relations, sql } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { numericAsNumber, tsvector } from '../types.js';
import { companies } from './companies.js';
import {
  currencyEnum,
  incotermEnum,
  listingKindEnum,
  listingStatusEnum,
  portTypeEnum,
  unitEnum,
} from './enums.js';

/** LARTAS: prohibitions and restrictions attached to an HS code. */
export type LartasFlags = {
  exportPermitRequired?: boolean;
  importPermitRequired?: boolean;
  quota?: boolean;
  note?: string;
};

export const hsCodes = pgTable(
  'hs_codes',
  {
    /** 8-digit BTKI code, stored without separators. */
    code: text('code').primaryKey(),
    chapter: text('chapter').notNull(),
    heading: text('heading').notNull(),
    descriptionId: text('description_id').notNull(),
    descriptionEn: text('description_en').notNull(),
    lartas: jsonb('lartas').$type<LartasFlags>(),
    dutyNote: text('duty_note'),
  },
  (table) => [
    index('hs_codes_chapter_idx').on(table.chapter),
    // Typeahead has to work for "kopi arabika" and "arabica coffee" alike, so
    // both descriptions get a trigram index.
    index('hs_codes_desc_id_trgm').using('gin', sql`${table.descriptionId} gin_trgm_ops`),
    index('hs_codes_desc_en_trgm').using('gin', sql`${table.descriptionEn} gin_trgm_ops`),
  ],
);

export const ports = pgTable(
  'ports',
  {
    /** UN/LOCODE — IDJKT, IDBLW, IDSUB … */
    unlocode: text('unlocode').primaryKey(),
    name: text('name').notNull(),
    province: text('province').notNull(),
    type: portTypeEnum('type').notNull().default('sea'),
  },
  (table) => [index('ports_province_idx').on(table.province)],
);

export const categories = pgTable(
  'categories',
  {
    id: text('id').primaryKey(),
    parentId: text('parent_id'),
    nameId: text('name_id').notNull(),
    nameEn: text('name_en').notNull(),
    sort: integer('sort').notNull().default(0),
  },
  (table) => [index('categories_parent_idx').on(table.parentId)],
);

export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    kind: listingKindEnum('kind').notNull(),

    titleId: text('title_id').notNull(),
    titleEn: text('title_en'),
    descriptionId: text('description_id'),
    descriptionEn: text('description_en'),

    hsCode: text('hs_code')
      .notNull()
      .references(() => hsCodes.code),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),

    quantity: numericAsNumber('quantity'),
    unit: unitEnum('unit'),
    moq: numericAsNumber('moq'),
    moqUnit: unitEnum('moq_unit'),
    capacityPerMonth: numericAsNumber('capacity_per_month'),

    priceMin: numericAsNumber('price_min'),
    priceMax: numericAsNumber('price_max'),
    currency: currencyEnum('currency'),
    /** Free text: "per MT FOB", "per 60kg bag", … */
    priceBasis: text('price_basis'),

    incoterm: incotermEnum('incoterm'),
    originPort: text('origin_port').references(() => ports.unlocode, { onDelete: 'set null' }),
    destinationPort: text('destination_port').references(() => ports.unlocode, {
      onDelete: 'set null',
    }),
    leadTimeDays: integer('lead_time_days'),

    certifications: text('certifications')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    packagingNote: text('packaging_note'),

    status: listingStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

    /**
     * Generated, so it can never fall out of sync with the row. Weighted:
     * title A, description B, HS code C. Config is `simple` rather than
     * `english`/`indonesian` because one index has to serve both languages —
     * stemming either one would hurt the other. `immutable_unaccent` is created
     * by src/bootstrap.ts; stock `unaccent` is only STABLE and Postgres refuses
     * it in a generated column.
     */
    searchVector: tsvector('search_vector').generatedAlwaysAs(
      (): ReturnType<typeof sql> => sql`
        setweight(to_tsvector('simple', immutable_unaccent(coalesce(${listings.titleId}, '') || ' ' || coalesce(${listings.titleEn}, ''))), 'A') ||
        setweight(to_tsvector('simple', immutable_unaccent(coalesce(${listings.descriptionId}, '') || ' ' || coalesce(${listings.descriptionEn}, ''))), 'B') ||
        setweight(to_tsvector('simple', coalesce(${listings.hsCode}, '')), 'C')
      `,
    ),
  },
  (table) => [
    index('listings_search_idx').using('gin', table.searchVector),
    // The main browse feed: filter on (status, kind) then keyset-paginate on
    // (published_at DESC, id DESC).
    index('listings_feed_idx').on(
      table.status,
      table.kind,
      table.publishedAt.desc(),
      table.id.desc(),
    ),
    index('listings_company_idx').on(table.companyId),
    index('listings_hs_idx').on(table.hsCode),
    index('listings_origin_port_idx').on(table.originPort),
    // Drives the expiry sweep job without scanning the whole table.
    index('listings_expiry_idx')
      .on(table.expiresAt)
      .where(sql`${table.status} = 'active'`),
  ],
);

export const listingMedia = pgTable(
  'listing_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    r2Key: text('r2_key').notNull(),
    width: integer('width'),
    height: integer('height'),
    sort: integer('sort').notNull().default(0),
    alt: text('alt'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('listing_media_listing_idx').on(table.listingId, table.sort)],
);

/**
 * Daily rollup, not per-event. Neon's free tier gives 0.5 GB and raw view
 * events are the fastest way to spend it.
 */
export const listingViews = pgTable(
  'listing_views',
  {
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    day: date('day').notNull(),
    count: integer('count').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.listingId, table.day] })],
);

export const listingsRelations = relations(listings, ({ one, many }) => ({
  company: one(companies, { fields: [listings.companyId], references: [companies.id] }),
  hsCode: one(hsCodes, { fields: [listings.hsCode], references: [hsCodes.code] }),
  origin: one(ports, { fields: [listings.originPort], references: [ports.unlocode] }),
  media: many(listingMedia),
}));

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(listings, { fields: [listingMedia.listingId], references: [listings.id] }),
}));
