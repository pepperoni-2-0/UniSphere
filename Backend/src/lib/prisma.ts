/**
 * @module lib/prisma
 * @description Singleton Prisma client with dev-safe caching.
 *
 * Uses the `globalThis` pattern so that hot-reloading (via `tsx watch` or
 * similar) does not spin up a new database connection pool on every reload.
 * Query logging is enabled automatically when `NODE_ENV !== 'production'`.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Augment the global namespace so TypeScript allows us to cache the client
 * on `globalThis` without type errors.
 */
const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

/**
 * Determine whether we are running in a development environment.
 * Any value other than `'production'` is treated as development.
 */
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Create or reuse a PrismaClient instance.
 *
 * In development the instance is cached on `globalThis` so that successive
 * module reloads (hot-reload) share the same connection pool instead of
 * exhausting the database's connection limit.
 *
 * Query-level logging (`query`, `info`, `warn`, `error`) is enabled in
 * non-production environments for easier debugging.
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: isDev
      ? [
          { level: 'query', emit: 'stdout' },
          { level: 'info', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
          { level: 'error', emit: 'stdout' },
        ]
      : [
          { level: 'warn', emit: 'stdout' },
          { level: 'error', emit: 'stdout' },
        ],
  });

  return client;
}

/**
 * The singleton Prisma client used across the entire application.
 *
 * @example
 * ```ts
 * import { prisma } from '../lib/prisma.js';
 *
 * const users = await prisma.user.findMany();
 * ```
 */
export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? createPrismaClient();

if (isDev) {
  globalForPrisma.__prisma = prisma;
}

/**
 * Gracefully disconnect the Prisma client.
 *
 * Call this during server shutdown (e.g. in a `SIGTERM` handler) to ensure
 * all pending queries are flushed and the connection pool is released.
 *
 * @example
 * ```ts
 * process.on('SIGTERM', async () => {
 *   await disconnectPrisma();
 *   process.exit(0);
 * });
 * ```
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
