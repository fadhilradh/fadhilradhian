import { ERROR_CODES, type ErrorResponse } from '@niaga/contracts';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { env } from './env.js';
import databasePlugin from './plugins/database.js';
import { healthRoutes } from './routes/health.js';
import { manifestRoutes } from './routes/manifest.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.isProduction ? undefined : { target: 'pino-pretty' },
      // Never log a bearer token or a session cookie.
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
    trustProxy: true,
    // Fly.io terminates TLS and forwards the request id; reuse it so a client
    // can quote one id across the whole stack.
    requestIdHeader: 'fly-request-id',
  }).withTypeProvider<ZodTypeProvider>();

  // Zod is the single contract: the same schema validates the request and
  // generates the OpenAPI document the client is typed against.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, {
    // The API serves JSON only; CSP belongs on the Netlify side.
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true,
  });

  /**
   * In-memory limiter for now. Phase 1 moves the counters to Upstash Redis —
   * Redis is in this stack for rate limiting and nothing else, since jobs run
   * on pg-boss.
   */
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Niaga API',
        description:
          'Verified Indonesian import/export marketplace. Schemas are generated from the same Zod contracts the web client imports.',
        version: '0.0.0',
      },
      servers: [
        { url: env.isProduction ? 'https://api.niaga.example' : `http://localhost:${env.PORT}` },
      ],
      tags: [
        { name: 'meta', description: 'Health and diagnostics' },
        { name: 'listings', description: 'Offers and requests' },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(scalar, { routePrefix: '/docs' });

  await app.register(databasePlugin);

  // Both handlers must be installed *before* any route plugin is registered:
  // each encapsulated context inherits the error handler in force at the moment
  // it is created, so routes registered first would keep Fastify's default.
  app.setNotFoundHandler((request, reply) => {
    const body: ErrorResponse = {
      error: {
        code: ERROR_CODES.notFound,
        message: `No route for ${request.method} ${request.url}`,
        requestId: request.id,
      },
    };
    return reply.code(404).send(body);
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    // Validation failures carry per-field messages the client attaches to inputs.
    if (hasZodFastifySchemaValidationErrors(error)) {
      const fields: Record<string, string> = {};
      for (const issue of error.validation) {
        // instancePath is a JSON pointer ("/originPort"); the client wants a dot
        // path. "_" is the bucket for errors that belong to the whole body.
        const path = issue.instancePath.replace(/^\//, '').replaceAll('/', '.') || '_';
        fields[path] = issue.message ?? 'Invalid value';
      }

      const body: ErrorResponse = {
        error: {
          code: ERROR_CODES.validationFailed,
          message: 'Some fields need fixing.',
          fields,
          requestId: request.id,
        },
      };
      return reply.code(400).send(body);
    }

    const status = error.statusCode ?? 500;

    if (status >= 500) {
      request.log.error({ err: error }, 'unhandled error');
    }

    const body: ErrorResponse = {
      error: {
        code: status === 429 ? ERROR_CODES.rateLimited : mapStatusToCode(status),
        // Internal messages never reach the client; everything else is already
        // written for a human.
        message: status >= 500 ? 'Something broke on our side. Try again.' : error.message,
        requestId: request.id,
      },
    };
    return reply.code(status).send(body);
  });

  await app.register(healthRoutes);
  await app.register(manifestRoutes);

  return app;
}

function mapStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.badRequest;
    case 401:
      return ERROR_CODES.unauthorized;
    case 403:
      return ERROR_CODES.forbidden;
    case 404:
      return ERROR_CODES.notFound;
    case 409:
      return ERROR_CODES.conflict;
    default:
      return ERROR_CODES.internal;
  }
}
