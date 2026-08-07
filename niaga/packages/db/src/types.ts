import { customType } from 'drizzle-orm/pg-core';

/**
 * Postgres `tsvector`. Drizzle has no built-in, and we only ever read it
 * through `@@` operators, so a thin custom type is enough.
 */
export const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'tsvector';
  },
});

/**
 * Money as `numeric(14,2)` mapped to a JS number. Safe here because listing
 * prices are indicative ranges, not ledger amounts — when escrow lands in
 * phase 6, those amounts get their own integer-minor-unit columns.
 */
export const numericAsNumber = customType<{ data: number; driverData: string }>({
  dataType() {
    return 'numeric(14, 2)';
  },
  fromDriver(value) {
    return Number(value);
  },
  toDriver(value) {
    return String(value);
  },
});
