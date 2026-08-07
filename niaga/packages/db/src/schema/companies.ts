import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './auth.js';
import {
  apiTypeEnum,
  documentKindEnum,
  documentStatusEnum,
  entityTypeEnum,
  laneEnum,
  memberRoleEnum,
  verificationSourceEnum,
} from './enums.js';

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    legalName: text('legal_name').notNull(),
    brandName: text('brand_name').notNull(),

    // Indonesian trade registration identifiers. All nullable: a company can
    // exist on the platform in the red lane with none of them filled in.
    nib: text('nib'),
    npwp: text('npwp'),
    apiType: apiTypeEnum('api_type'),
    customsNik: text('customs_nik'),
    entityType: entityTypeEnum('entity_type'),

    province: text('province'),
    city: text('city'),
    address: text('address'),
    website: text('website'),
    phone: text('phone'),

    aboutId: text('about_id'),
    aboutEn: text('about_en'),
    employeeRange: text('employee_range'),
    yearEstablished: integer('year_established'),

    verificationLane: laneEnum('verification_lane').notNull().default('red'),
    verificationSource: verificationSourceEnum('verification_source').notNull().default('manual'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: text('verified_by').references(() => users.id, { onDelete: 'set null' }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('companies_slug_key').on(table.slug),
    // NIB is unique when present — two accounts claiming one NIB is the first
    // scam signal worth blocking outright.
    uniqueIndex('companies_nib_key')
      .on(table.nib)
      .where(sql`${table.nib} is not null`),
    index('companies_lane_idx').on(table.verificationLane),
    index('companies_province_idx').on(table.province),
  ],
);

export const companyMembers = pgTable(
  'company_members',
  {
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('staff'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.companyId, table.userId] }),
    index('company_members_user_idx').on(table.userId),
  ],
);

/**
 * Verification documents. `r2Key` points at the **private** bucket; reviewers
 * read it through a short-TTL signed URL and nothing else ever does.
 */
export const companyDocuments = pgTable(
  'company_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    kind: documentKindEnum('kind').notNull(),
    r2Key: text('r2_key').notNull(),
    fileName: text('file_name'),
    byteSize: integer('byte_size'),
    status: documentStatusEnum('status').notNull().default('pending'),
    reviewerNote: text('reviewer_note'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('company_documents_company_idx').on(table.companyId),
    index('company_documents_status_idx').on(table.status),
  ],
);

export const companiesRelations = relations(companies, ({ many }) => ({
  members: many(companyMembers),
  documents: many(companyDocuments),
}));

export const companyMembersRelations = relations(companyMembers, ({ one }) => ({
  company: one(companies, { fields: [companyMembers.companyId], references: [companies.id] }),
  user: one(users, { fields: [companyMembers.userId], references: [users.id] }),
}));

export const companyDocumentsRelations = relations(companyDocuments, ({ one }) => ({
  company: one(companies, { fields: [companyDocuments.companyId], references: [companies.id] }),
}));
