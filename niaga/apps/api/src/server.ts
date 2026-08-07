import { buildApp } from './app.js';
import { env } from './env.js';

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error({ err: error }, 'failed to start');
  process.exit(1);
}

/**
 * Fly.io sends SIGTERM and waits before SIGKILL. Draining in-flight requests
 * and closing the Postgres pool keeps Neon's connection count honest across
 * deploys.
 */
let shuttingDown = false;

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, 'shutting down');

    const timeout = setTimeout(() => {
      app.log.error('shutdown timed out after 10s, exiting');
      process.exit(1);
    }, 10_000);

    app
      .close()
      .then(() => {
        clearTimeout(timeout);
        process.exit(0);
      })
      .catch((error: unknown) => {
        app.log.error({ err: error }, 'error during shutdown');
        clearTimeout(timeout);
        process.exit(1);
      });
  });
}
