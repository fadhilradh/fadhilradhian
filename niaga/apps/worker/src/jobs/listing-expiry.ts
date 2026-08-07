import { and, eq, lte, sql, type Database } from '@niaga/db';
import { listings } from '@niaga/db/schema';
import type { Logger } from 'pino';

/**
 * Flips active listings whose `expires_at` has passed to 'expired'.
 *
 * A stale offer is worse than no offer: a buyer who inquires about last
 * season's coffee and gets no reply learns not to trust the feed. Runs hourly;
 * the partial index on (expires_at) where status = 'active' keeps it cheap.
 */
export async function sweepExpiredListings(db: Database, logger: Logger): Promise<number> {
  const expired = await db
    .update(listings)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(and(eq(listings.status, 'active'), lte(listings.expiresAt, sql`now()`)))
    .returning({ id: listings.id });

  if (expired.length > 0) {
    logger.info({ count: expired.length }, 'expired listings swept');
  }

  return expired.length;
}
