import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

export * from './schema/index.js';
export * as schema from './schema/index.js';
export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  lt,
  lte,
  or,
  sql,
} from 'drizzle-orm';

export type Database = ReturnType<typeof createDatabase>;

export type CreateDatabaseOptions = {
  url: string;
  /**
   * Neon suspends idle compute, so a large idle pool buys nothing. Fly.io runs
   * one small machine per app; ten connections is plenty and stays well inside
   * Neon's free-tier limit.
   */
  max?: number;
};

export function createDatabase({ url, max = 10 }: CreateDatabaseOptions) {
  const client = postgres(url, {
    max,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // pooled Neon endpoints do not support named prepared statements
  });

  return drizzle(client, { schema });
}
