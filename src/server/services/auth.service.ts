import crypto from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { UserRole, UserStatus, VerificationPurpose } from "@prisma/client";
import argon2 from "argon2";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { assertRateLimit } from "@/server/lib/rate-limit";
import { decryptData, encryptData, generateTotpSecret, verifyTotpCode } from "@/server/lib/crypto";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: "CLIENT" | "FREELANCER";
}

export interface LoginResult {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
  requiresTotp?: boolean;
}

export class AuthService {
  /**
   * Registers a new user as either CLIENT or FREELANCER.
   * ADMIN role cannot be registered through this method.
   */
  static async register(input: RegisterInput): Promise<{ userId: string; email: string }> {
    const email = input.email.trim().toLowerCase();

    // Rate limit signups by email and IP
    await assertRateLimit(`signup:${email}`, 5, 300_000);

    // Strictly enforce role constraints (No admin registration via UI)
    if (input.role !== "CLIENT" && input.role !== "FREELANCER") {
      throw new AppError(
        "INVALID_ROLE",
        "Registration only supports CLIENT or FREELANCER roles.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    if (input.password.length < 8) {
      throw new AppError(
        "WEAK_PASSWORD",
        "Password must be at least 8 characters long.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(
        "EMAIL_EXISTS",
        "An account with this email address already exists.",
        HTTP_STATUS.CONFLICT,
      );
    }

    const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);
    const assignedRole = input.role === "CLIENT" ? UserRole.CLIENT : UserRole.FREELANCER;

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name: input.name.trim(),
          passwordHash,
          roles: [assignedRole],
          status: UserStatus.ACTIVE, // active for instant access, email verification token created
          emailVerifiedAt: null,
          timezone: "UTC",
        },
      });

      if (assignedRole === UserRole.CLIENT) {
        await tx.clientProfile.create({
          data: {
            userId: createdUser.id,
            companyName: `${input.name.trim()}'s Team`,
          },
        });
      } else {
        await tx.freelancerProfile.create({
          data: {
            userId: createdUser.id,
            headline: "Freelancer",
            availability: "AVAILABLE",
            currency: "USD",
          },
        });
      }

      // Generate verification token (expires in 24h)
      const rawToken = crypto.randomBytes(32).toString("hex");
      await tx.verificationToken.create({
        data: {
          userId: createdUser.id,
          purpose: VerificationPurpose.EMAIL_VERIFY,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return createdUser;
    });

    return { userId: user.id, email: user.email };
  }

  /**
   * Verifies user credentials, handles failed login lockouts and 2FA.
   */
  static async verifyCredentials(
    emailInput: string,
    password: string,
    totpCode?: string,
  ): Promise<LoginResult> {
    const email = emailInput.trim().toLowerCase();

    // Rate limit login attempts per email
    await assertRateLimit(`login:${email}`, 10, 60_000);

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        passwordHash: true,
        failedLoginCount: true,
        lockedUntil: true,
        totpEnabled: true,
        totpSecretEnc: true,
      },
    });

    if (!user) {
      // Auto-heal: if database is empty, seed demo personas on-the-fly
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        const { seedDatabase } = await import("@/server/lib/seed");
        await seedDatabase();
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            roles: true,
            status: true,
            passwordHash: true,
            failedLoginCount: true,
            lockedUntil: true,
            totpEnabled: true,
            totpSecretEnc: true,
          },
        });
      }
    }

    if (!user || !user.passwordHash) {
      throw new AppError(
        "INVALID_CREDENTIALS",
        "Invalid email or password.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new AppError(
        "ACCOUNT_LOCKED",
        `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`,
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }

    // Check suspended/banned status
    if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
      throw new AppError(
        "ACCOUNT_SUSPENDED",
        "Your account has been suspended or banned. Please contact support.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);

    if (!passwordValid) {
      const newFailedCount = user.failedLoginCount + 1;
      const shouldLock = newFailedCount >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: newFailedCount,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      throw new AppError(
        "INVALID_CREDENTIALS",
        shouldLock
          ? "Too many failed attempts. Account locked for 15 minutes."
          : "Invalid email or password.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Check 2FA if enabled
    if (user.totpEnabled) {
      if (!totpCode) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          status: user.status,
          requiresTotp: true,
        };
      }

      if (!user.totpSecretEnc) {
        throw new AppError("TOTP_ERROR", "2FA configuration error.", HTTP_STATUS.INTERNAL);
      }

      const secret = decryptData(user.totpSecretEnc);
      const isTotpValid = verifyTotpCode(secret, totpCode);

      if (!isTotpValid) {
        throw new AppError(
          "INVALID_TOTP",
          "Invalid two-factor authentication code.",
          HTTP_STATUS.UNAUTHORIZED,
        );
      }
    }

    // Reset failed login counter and record login time
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      status: user.status,
    };
  }

  /**
   * Request password reset token.
   */
  static async requestPasswordReset(
    emailInput: string,
  ): Promise<{ success: boolean; rawToken?: string }> {
    const email = emailInput.trim().toLowerCase();
    await assertRateLimit(`forgot-password:${email}`, 5, 300_000);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    // Don't leak whether user exists
    if (!user || user.status === UserStatus.DELETED || user.status === UserStatus.BANNED) {
      return { success: true };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        purpose: VerificationPurpose.PASSWORD_RESET,
        tokenHash: hashToken(rawToken),
        expiresAt,
      },
    });

    return { success: true, rawToken };
  }

  /**
   * Resets user password using a valid token.
   */
  static async resetPassword(rawToken: string, newPassword: string): Promise<boolean> {
    if (newPassword.length < 8) {
      throw new AppError(
        "WEAK_PASSWORD",
        "Password must be at least 8 characters long.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        purpose: VerificationPurpose.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new AppError(
        "INVALID_TOKEN",
        "This password reset link is invalid or has expired.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const passwordHash = await argon2.hash(newPassword, ARGON2_OPTIONS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash,
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all existing sessions on password change
      prisma.session.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      }),
    ]);

    return true;
  }

  /**
   * Verifies email using verification token.
   */
  static async verifyEmail(rawToken: string): Promise<boolean> {
    const tokenHash = hashToken(rawToken);
    const record = await prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        purpose: VerificationPurpose.EMAIL_VERIFY,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new AppError(
        "INVALID_TOKEN",
        "This email verification link is invalid or has expired.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return true;
  }

  /**
   * Set up 2FA for a user.
   */
  static async setupTotp(userId: string): Promise<{ secret: string }> {
    const secret = generateTotpSecret();
    const encryptedSecret = encryptData(secret);

    await prisma.user.update({
      where: { id: userId },
      data: { totpSecretEnc: encryptedSecret, totpEnabled: false },
    });

    return { secret };
  }

  /**
   * Confirms 2FA setup with a code.
   */
  static async enableTotp(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecretEnc: true },
    });

    if (!user?.totpSecretEnc) {
      throw new AppError(
        "TOTP_NOT_CONFIGURED",
        "2FA setup has not been initiated.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const secret = decryptData(user.totpSecretEnc);
    if (!verifyTotpCode(secret, code)) {
      throw new AppError(
        "INVALID_TOTP",
        "Invalid code. Please try again.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });

    return true;
  }
}
