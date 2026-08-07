import { createDatabase } from '@niaga/db';
import { config } from 'dotenv';
import { PgBoss } from 'pg-boss';
import { pino } from 'pino';

import { sweepExpiredListings } from './jobs/listing-expiry.js';
import { ALL_QUEUES, QUEUES } from './queues.js';

config({ path: new URL('../../../.env', import.meta.url).pathname, quiet: true });

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Unlike the API, the worker has nothing useful to do without a database —
  // its queue *is* the database.
  logger.error('DATABASE_URL is required to run the worker');
  process.exit(1);
}

const db = createDatabase({ url: databaseUrl, max: 4 });

const boss = new PgBoss({
  connectionString: databaseUrl,
  schema: 'pgboss',
  max: 4,
});

boss.on('error', (error: unknown) => logger.error({ err: error }, 'pg-boss error'));

await boss.start();

for (const queue of ALL_QUEUES) {
  await boss.createQueue(queue);
}

await boss.work(
  QUEUES.listingExpirySweep,
  {
    // Neon suspends idle compute, so a slow poll keeps the instance from being
    // held awake for nothing. This job runs hourly; five seconds of latency on
    // picking it up is irrelevant.
    pollingIntervalSeconds: 5,
  },
  async () => {
    await sweepExpiredListings(db, logger);
  },
);

// Hourly. pg-boss stores the schedule in Postgres, so it survives restarts and
// only one machine ever fires it.
await boss.schedule(QUEUES.listingExpirySweep, '0 * * * *', undefined, { tz: 'Asia/Jakarta' });

logger.info({ queues: ALL_QUEUES }, 'worker ready');

let shuttingDown = false;

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'shutting down');

    // stop() waits for in-flight jobs; anything still running after 15s would
    // be retried by pg-boss anyway.
    boss
      .stop({ graceful: true, timeout: 15_000 })
      .then(() => db.$client.end({ timeout: 5 }))
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        logger.error({ err: error }, 'error during shutdown');
        process.exit(1);
      });
  });
}
