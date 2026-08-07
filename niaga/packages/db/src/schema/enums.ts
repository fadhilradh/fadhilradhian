import {
  API_TYPES,
  CURRENCIES,
  DOCUMENT_KINDS,
  ENTITY_TYPES,
  INCOTERMS,
  INQUIRY_STATUSES,
  LANES,
  LISTING_KINDS,
  LISTING_STATUSES,
  LOCALES,
  UNITS,
} from '@niaga/contracts';
import { pgEnum } from 'drizzle-orm/pg-core';

// Every enum is defined once in @niaga/contracts and projected into Postgres
// here, so the validator and the column can never drift.
export const laneEnum = pgEnum('lane', LANES);
export const listingKindEnum = pgEnum('listing_kind', LISTING_KINDS);
export const listingStatusEnum = pgEnum('listing_status', LISTING_STATUSES);
export const unitEnum = pgEnum('unit', UNITS);
export const incotermEnum = pgEnum('incoterm', INCOTERMS);
export const currencyEnum = pgEnum('currency', CURRENCIES);
export const entityTypeEnum = pgEnum('entity_type', ENTITY_TYPES);
export const apiTypeEnum = pgEnum('api_type', API_TYPES);
export const localeEnum = pgEnum('locale', LOCALES);
export const documentKindEnum = pgEnum('document_kind', DOCUMENT_KINDS);
export const inquiryStatusEnum = pgEnum('inquiry_status', INQUIRY_STATUSES);

export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'staff']);
export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'approved',
  'rejected',
  'expired',
]);
export const portTypeEnum = pgEnum('port_type', ['sea', 'air', 'dry']);
export const reportStatusEnum = pgEnum('report_status', ['open', 'actioned', 'dismissed']);
export const verificationSourceEnum = pgEnum('verification_source', ['manual', 'oss_api']);
export const alertFrequencyEnum = pgEnum('alert_frequency', ['off', 'daily', 'weekly']);
