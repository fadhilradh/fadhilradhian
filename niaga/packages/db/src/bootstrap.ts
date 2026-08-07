import { config } from 'dotenv';
import postgres from 'postgres';

/**
 * Runs before `drizzle-kit migrate`. Two things Drizzle can't express in a
 * schema file:
 *
 *  1. Extensions — pg_trgm for fuzzy commodity names ("kopi arabika" vs
 *     "arabica coffee"), unaccent for the same reason.
 *  2. `immutable_unaccent` — the generated `search_vector` column needs an
 *     IMMUTABLE function, and stock `unaccent(text)` is only STABLE because it
 *     reads a dictionary at runtime. Pinning the dictionary makes it safe to
 *     mark immutable. If the dictionary ever changes, existing tsvectors must
 *     be rebuilt; that's the trade for having the column generated at all.
 *
 * Idempotent, so it is safe on every deploy.
 */
config({ path: '../../.env', quiet: true });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  console.error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set to bootstrap the database.');
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

try {
  await sql`create extension if not exists pg_trgm`;
  await sql`create extension if not exists unaccent`;
  await sql.unsafe(`
    create or replace function immutable_unaccent(text)
    returns text
    language sql
    immutable
    parallel safe
    strict
    as $$ select public.unaccent('public.unaccent'::regdictionary, $1) $$;
  `);
  console.warn('bootstrap: extensions and immutable_unaccent ready');
} finally {
  await sql.end();
}
