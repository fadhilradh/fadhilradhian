import { relations } from 'drizzle-orm';
import { index, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './auth.js';
import { companies } from './companies.js';
import { alertFrequencyEnum, inquiryStatusEnum, reportStatusEnum } from './enums.js';
import { listings } from './trade.js';

/**
 * An inquiry is the unit of value on this platform. Contact details stay hidden
 * until `status` leaves 'open' — see DECISIONS.md §4 for the WhatsApp handoff.
 */
export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    fromCompanyId: uuid('from_company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    toCompanyId: uuid('to_company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    status: inquiryStatusEnum('status').notNull().default('open'),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('inquiries_to_company_idx').on(table.toCompanyId, table.createdAt.desc()),
    index('inquiries_from_company_idx').on(table.fromCompanyId, table.createdAt.desc()),
    index('inquiries_listing_idx').on(table.listingId),
  ],
);

export type MessageAttachment = { r2Key: string; fileName: string; byteSize: number };

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inquiryId: uuid('inquiry_id')
      .notNull()
      .references(() => inquiries.id, { onDelete: 'cascade' }),
    senderUserId: text('sender_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    attachments: jsonb('attachments').$type<MessageAttachment[]>(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('messages_inquiry_idx').on(table.inquiryId, table.createdAt)],
);

export const favorites = pgTable(
  'favorites',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.listingId] })],
);

/** `query` holds the same object the browse URL serialises, so a saved search
 *  and a shared link are the same thing. */
export const savedSearches = pgTable(
  'saved_searches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    query: jsonb('query').$type<Record<string, unknown>>().notNull(),
    alertFrequency: alertFrequencyEnum('alert_frequency').notNull().default('off'),
    lastNotifiedAt: timestamp('last_notified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('saved_searches_user_idx').on(table.userId)],
);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    reporterUserId: text('reporter_user_id').references(() => users.id, { onDelete: 'set null' }),
    reason: text('reason').notNull(),
    notes: text('notes'),
    status: reportStatusEnum('status').notNull().default('open'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reports_target_idx').on(table.targetType, table.targetId),
    index('reports_status_idx').on(table.status),
  ],
);

/** Append-only. Every lane change, takedown and role grant lands here. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    target: text('target').notNull(),
    diff: jsonb('diff').$type<Record<string, unknown>>(),
    ip: text('ip'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_log_target_idx').on(table.target),
    index('audit_log_created_idx').on(table.createdAt.desc()),
  ],
);

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  listing: one(listings, { fields: [inquiries.listingId], references: [listings.id] }),
  fromCompany: one(companies, {
    relationName: 'inquiriesSent',
    fields: [inquiries.fromCompanyId],
    references: [companies.id],
  }),
  toCompany: one(companies, {
    relationName: 'inquiriesReceived',
    fields: [inquiries.toCompanyId],
    references: [companies.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  inquiry: one(inquiries, { fields: [messages.inquiryId], references: [inquiries.id] }),
  sender: one(users, { fields: [messages.senderUserId], references: [users.id] }),
}));
