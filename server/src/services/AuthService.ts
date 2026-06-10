import { prisma } from '../lib/prisma.js';
import type { ServiceResult, ErrorCode } from '../types/index.js';
import { RegisterUserSchema } from '../types/index.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Sanitised user profile — passwordHash is always stripped before returning. */
export interface UserProfile {
  id: string;
  roleId: string;
  primaryCampusId: string;
  officialEmail: string;
  personalEmail: string | null;
  personalEmailVerified: boolean;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatarUrl: string | null;
  branch: string | null;
  batch: string | null;
  bio: string | null;
  status: string;
  customStatusText: string | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: { id: string; name: string; description: string | null };
  primaryCampus: {
    id: string;
    name: string;
    shortName: string;
    code: string;
    logoUrl: string | null;
  };
}

/** Shape accepted by `registerUser`. */
interface RegisterUserInput {
  officialEmail: string;
  password: string;
  firstName: string;
  lastName: string;
  campusCode: string;
  branch?: string;
  batch?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_SALT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * AuthService encapsulates all authentication and user-lifecycle operations
 * including registration, credential validation, email verification and the
 * critical student → alumni transition.
 */
export class AuthService {
  // -----------------------------------------------------------------------
  // registerUser
  // -----------------------------------------------------------------------

  /**
   * Register a new user on the platform.
   *
   * @param data - Registration payload (validated against RegisterUserSchema).
   * @returns The newly created user's ID on success, or a structured error.
   *
   * @remarks
   * - The default role assigned is **STUDENT**.
   * - Passwords are hashed with bcrypt using 12 salt rounds.
   * - An audit-log entry is created atomically inside the same transaction.
   */
  async registerUser(
    data: RegisterUserInput,
  ): Promise<ServiceResult<{ userId: string }>> {
    try {
      // 1. Validate input ────────────────────────────────────────────────────
      const parsed = RegisterUserSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join('; '),
          code: 'VALIDATION_ERROR' as ErrorCode,
        };
      }
      const validated = parsed.data;

      // 2. Check for duplicate official email ────────────────────────────────
      const existingUser = await prisma.user.findFirst({
        where: { officialEmail: validated.officialEmail, deletedAt: null },
      });
      if (existingUser) {
        return {
          success: false,
          error: 'A user with this official email already exists',
          code: 'CONFLICT' as ErrorCode,
        };
      }

      // 3. Resolve campus by code ────────────────────────────────────────────
      const campus = await prisma.campus.findFirst({
        where: { code: validated.campusCode, deletedAt: null },
      });
      if (!campus) {
        return {
          success: false,
          error: `Campus with code "${validated.campusCode}" not found`,
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 4. Resolve default STUDENT role ──────────────────────────────────────
      const studentRole = await prisma.role.findFirst({
        where: { name: 'STUDENT' },
      });
      if (!studentRole) {
        return {
          success: false,
          error: 'Default STUDENT role is not configured',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 5. Hash password ─────────────────────────────────────────────────────
      const passwordHash = await bcrypt.hash(
        validated.password,
        BCRYPT_SALT_ROUNDS,
      );

      // 6. Create user + audit log inside a transaction ──────────────────────
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            officialEmail: validated.officialEmail,
            passwordHash,
            firstName: validated.firstName,
            lastName: validated.lastName,
            displayName: validated.displayName,
            roleId: studentRole.id,
            primaryCampusId: campus.id,
            branch: (validated as RegisterUserInput).branch ?? null,
            batch: (validated as RegisterUserInput).batch ?? null,
            status: 'ACTIVE',
            personalEmailVerified: false,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: newUser.id,
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: newUser.id,
          },
        });

        return newUser;
      });

      // 7. Return ────────────────────────────────────────────────────────────
      return { success: true, data: { userId: user.id } };
    } catch (error) {
      throw error;
    }
  }

  // -----------------------------------------------------------------------
  // validateCredentials
  // -----------------------------------------------------------------------

  /**
   * Validate a user's login credentials.
   *
   * @param email    - The user's official email address.
   * @param password - The plain-text password to verify.
   * @returns The sanitised user profile on success, or an UNAUTHORIZED error.
   *
   * @remarks
   * - `lastSeenAt` is updated on every successful authentication.
   * - The `passwordHash` field is **never** returned to the caller.
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<ServiceResult<{ user: UserProfile }>> {
    try {
      // 1. Look up user by official email ────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { officialEmail: email, deletedAt: null },
        include: {
          role: true,
          primaryCampus: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
          code: 'UNAUTHORIZED' as ErrorCode,
        };
      }

      // 2. Compare password hash ─────────────────────────────────────────────
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return {
          success: false,
          error: 'Invalid credentials',
          code: 'UNAUTHORIZED' as ErrorCode,
        };
      }

      // 3. Update lastSeenAt ─────────────────────────────────────────────────
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      });

      // 4. Strip passwordHash and return ─────────────────────────────────────
      const { passwordHash: _hash, ...profile } = user;

      return {
        success: true,
        data: { user: profile as UserProfile },
      };
    } catch (error) {
      throw error;
    }
  }

  // -----------------------------------------------------------------------
  // addPersonalEmail
  // -----------------------------------------------------------------------

  /**
   * Attach a personal email address to a user account.
   *
   * A verification token (UUID v4) is generated and stored alongside the
   * email. The token expires after 24 hours.
   *
   * @param userId - The target user's ID.
   * @param email  - The personal email to add.
   * @returns The verification token that should be sent to the user via email.
   */
  async addPersonalEmail(
    userId: string,
    email: string,
  ): Promise<ServiceResult<{ verificationToken: string }>> {
    try {
      // 1. Verify user exists ────────────────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Check email uniqueness across official & personal emails ──────────
      const emailInUse = await prisma.user.findFirst({
        where: {
          id: { not: userId },
          deletedAt: null,
          OR: [
            { officialEmail: email },
            { personalEmail: email },
          ],
        },
      });
      if (emailInUse) {
        return {
          success: false,
          error: 'This email address is already associated with another account',
          code: 'CONFLICT' as ErrorCode,
        };
      }

      // 3. Generate verification token ───────────────────────────────────────
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // 4. Persist ───────────────────────────────────────────────────────────
      await prisma.user.update({
        where: { id: userId },
        data: {
          personalEmail: email,
          emailVerificationToken: token,
          emailVerificationExpiresAt: expiresAt,
          personalEmailVerified: false,
        },
      });

      return { success: true, data: { verificationToken: token } };
    } catch (error) {
      throw error;
    }
  }

  // -----------------------------------------------------------------------
  // verifyPersonalEmail
  // -----------------------------------------------------------------------

  /**
   * Verify a user's personal email using the previously issued token.
   *
   * @param userId - The user whose email is being verified.
   * @param token  - The UUID token that was sent to the personal email.
   * @returns `{ verified: true }` on success, or an INVALID_TOKEN error.
   */
  async verifyPersonalEmail(
    userId: string,
    token: string,
  ): Promise<ServiceResult<{ verified: boolean }>> {
    try {
      // 1. Fetch user ────────────────────────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Validate token match ──────────────────────────────────────────────
      if (user.emailVerificationToken !== token) {
        return {
          success: false,
          error: 'Invalid verification token',
          code: 'INVALID_TOKEN' as ErrorCode,
        };
      }

      // 3. Check token expiry ────────────────────────────────────────────────
      if (
        !user.emailVerificationExpiresAt ||
        user.emailVerificationExpiresAt < new Date()
      ) {
        return {
          success: false,
          error: 'Verification token has expired',
          code: 'INVALID_TOKEN' as ErrorCode,
        };
      }

      // 4. Mark as verified and clear token ──────────────────────────────────
      await prisma.user.update({
        where: { id: userId },
        data: {
          personalEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        },
      });

      // 5. Audit log ─────────────────────────────────────────────────────────
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'PERSONAL_EMAIL_VERIFIED',
          entityType: 'USER',
          entityId: userId,
        },
      });

      return { success: true, data: { verified: true } };
    } catch (error) {
      throw error;
    }
  }

  // -----------------------------------------------------------------------
  // transitionToAlumni
  // -----------------------------------------------------------------------

  /**
   * Transition a student to alumni status.
   *
   * This is the **critical lifecycle method** that:
   * 1. Changes the user's role from STUDENT → ALUMNI.
   * 2. Sets user status to GRADUATED.
   * 3. Revokes all official-channel memberships (soft-delete).
   * 4. Creates an `AlumniTransition` record for audit purposes.
   *
   * **Pre-conditions:**
   * - User must currently hold the STUDENT role.
   * - User must have a verified personal email (required for post-graduation
   *   communication since the official email will eventually be revoked).
   *
   * @param userId - The student's user ID.
   * @returns The transition record ID on success.
   */
  async transitionToAlumni(
    userId: string,
  ): Promise<ServiceResult<{ transitionId: string }>> {
    try {
      // 1. Fetch user with role ──────────────────────────────────────────────
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { role: true },
      });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // 2. Verify current role is STUDENT ────────────────────────────────────
      if (user.role.name !== 'STUDENT') {
        return {
          success: false,
          error: 'Only students can transition to alumni',
          code: 'FORBIDDEN' as ErrorCode,
        };
      }

      // 3. Verify personal email is set and verified ─────────────────────────
      if (!user.personalEmail || !user.personalEmailVerified) {
        return {
          success: false,
          error:
            'A verified personal email is required before transitioning to alumni. ' +
            'Please add and verify your personal email first.',
          code: 'EMAIL_NOT_VERIFIED' as ErrorCode,
        };
      }

      // 4. Execute transition inside an atomic transaction ───────────────────
      const transitionId = await prisma.$transaction(async (tx) => {
        // 4a. Resolve ALUMNI role
        const alumniRole = await tx.role.findFirst({
          where: { name: 'ALUMNI' },
        });
        if (!alumniRole) {
          throw new Error('ALUMNI role is not configured in the system');
        }

        // 4b. Create AlumniTransition record
        const transition = await tx.alumniTransition.create({
          data: {
            userId,
            personalEmailAtTransition: user.personalEmail!,
            previousRoleId: user.roleId,
            transitionedAt: new Date(),
            officialEmailRevoked: false,
          },
        });

        // 4c. Update user role and status
        await tx.user.update({
          where: { id: userId },
          data: {
            roleId: alumniRole.id,
            status: 'GRADUATED',
          },
        });

        // 4d. Soft-delete all channel memberships
        const revokedCount = await tx.channelMember.updateMany({
          where: { userId, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        // 4e. Create audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'ALUMNI_TRANSITION',
            entityType: 'USER',
            entityId: userId,
            details: {
              previousRoleId: user.roleId,
              previousRoleName: user.role.name,
              revokedChannelMemberships: revokedCount.count,
            },
          },
        });

        return transition.id;
      });

      return { success: true, data: { transitionId } };
    } catch (error) {
      throw error;
    }
  }

  // -----------------------------------------------------------------------
  // getUserProfile
  // -----------------------------------------------------------------------

  /**
   * Retrieve the full profile for a user.
   *
   * @param userId - The user's ID.
   * @returns The sanitised profile (passwordHash excluded) with role and
   *          campus relations eagerly loaded.
   */
  async getUserProfile(
    userId: string,
  ): Promise<ServiceResult<UserProfile>> {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: {
          role: true,
          primaryCampus: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND' as ErrorCode,
        };
      }

      // Strip sensitive field
      const { passwordHash: _hash, ...profile } = user;

      return { success: true, data: profile as UserProfile };
    } catch (error) {
      throw error;
    }
  }
}
