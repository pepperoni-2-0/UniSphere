/**
 * @module middleware/campusIsolation
 * @description Prisma middleware and utility that enforce campus-level data
 * isolation for official channels.
 *
 * Two complementary exports:
 *
 * 1. **`applyCampusIsolationMiddleware`** – attaches a `$use()` middleware to
 *    the Prisma client that automatically guards `ChannelMember.create`
 *    operations at the ORM level.
 *
 * 2. **`validateCampusAccess`** – a standalone async function performing the
 *    same check, useful when services need to validate before building larger
 *    transactions.
 */

import { PrismaClient } from '@prisma/client';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Result returned by the standalone validation helper. */
export interface CampusAccessResult {
  /** `true` when the user is allowed to join the channel. */
  valid: boolean;
  /** Human-readable reason when `valid` is `false`. */
  error?: string;
}

// ─── Standalone validation utility ─────────────────────────────────────────────

/**
 * Check whether a user is permitted to join a specific official channel.
 *
 * Validation rules:
 * - Alumni (role.name === `'ALUMNI'`) are unconditionally denied.
 * - Non-alumni users must belong to the same campus as the channel.
 *
 * @param prisma   - An active PrismaClient instance.
 * @param userId   - UUID of the user attempting to join.
 * @param channelId - UUID of the target official channel.
 * @returns A `CampusAccessResult` indicating whether access is permitted.
 *
 * @example
 * ```ts
 * const check = await validateCampusAccess(prisma, userId, channelId);
 * if (!check.valid) {
 *   return { success: false, error: check.error!, code: 'CAMPUS_MISMATCH' };
 * }
 * ```
 */
export async function validateCampusAccess(
  prisma: PrismaClient,
  userId: string,
  channelId: string,
): Promise<CampusAccessResult> {
  // ── Fetch user with their role ──────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      primaryCampusId: true,
      role: { select: { name: true } },
    },
  });

  if (!user) {
    return { valid: false, error: `User not found: ${userId}` };
  }

  // ── Alumni guard ────────────────────────────────────────────────────────
  if (user.role.name === 'ALUMNI') {
    return {
      valid: false,
      error: 'Alumni cannot access official channels',
    };
  }

  // ── Fetch channel campus ────────────────────────────────────────────────
  const channel = await prisma.officialChannel.findUnique({
    where: { id: channelId },
    select: { id: true, campusId: true },
  });

  if (!channel) {
    return { valid: false, error: `Channel not found: ${channelId}` };
  }

  // ── Campus match ────────────────────────────────────────────────────────
  if (user.primaryCampusId !== channel.campusId) {
    return {
      valid: false,
      error:
        `Campus mismatch: user belongs to campus ${user.primaryCampusId} ` +
        `but channel belongs to campus ${channel.campusId}`,
    };
  }

  return { valid: true };
}

// ─── Prisma middleware ─────────────────────────────────────────────────────────

/**
 * Attach campus-isolation middleware to a PrismaClient instance.
 *
 * The middleware intercepts **`create`** actions on the **`ChannelMember`**
 * model. Before the row is inserted it:
 *
 * 1. Resolves the target user (including their `role` relation).
 * 2. Rejects alumni unconditionally.
 * 3. Resolves the target channel and compares campus IDs.
 * 4. Throws a descriptive error on mismatch; otherwise passes through.
 *
 * All other model/action combinations are forwarded to `next(params)`
 * without modification.
 *
 * @param prisma - The PrismaClient to attach the middleware to.
 *
 * @example
 * ```ts
 * import { prisma } from '../lib/prisma.js';
 * import { applyCampusIsolationMiddleware } from '../middleware/campusIsolation.js';
 *
 * applyCampusIsolationMiddleware(prisma);
 * ```
 */
export function applyCampusIsolationMiddleware(prisma: PrismaClient): void {
  (prisma as any).$use(async (params: any, next: any) => {
    // Only intercept ChannelMember creates
    if (params.model !== 'ChannelMember' || params.action !== 'create') {
      return next(params);
    }

    const data = params.args?.data;
    if (!data) {
      return next(params);
    }

    // Extract userId and channelId from the create payload.
    // Prisma allows either a scalar foreign key or a `connect` relation.
    const userId: string | undefined =
      data.userId ?? data.user?.connect?.id;
    const channelId: string | undefined =
      data.channelId ?? data.channel?.connect?.id;

    if (!userId || !channelId) {
      // Insufficient data to validate – let Prisma's own FK constraints
      // catch any problems downstream.
      return next(params);
    }

    // ── Fetch user with role ────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        primaryCampusId: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      throw new Error(
        `Campus isolation: user not found (id: ${userId})`,
      );
    }

    // ── Alumni guard ────────────────────────────────────────────────────
    if (user.role.name === 'ALUMNI') {
      throw new Error('Alumni cannot access official channels');
    }

    // ── Fetch channel ───────────────────────────────────────────────────
    const channel = await prisma.officialChannel.findUnique({
      where: { id: channelId },
      select: { id: true, campusId: true },
    });

    if (!channel) {
      throw new Error(
        `Campus isolation: channel not found (id: ${channelId})`,
      );
    }

    // ── Campus match ────────────────────────────────────────────────────
    if (user.primaryCampusId !== channel.campusId) {
      throw new Error(
        `Campus isolation violation: user ${userId} belongs to campus ` +
          `${user.primaryCampusId} but channel ${channelId} belongs to ` +
          `campus ${channel.campusId}`,
      );
    }

    // All checks passed – proceed with the original create.
    return next(params);
  });
}
