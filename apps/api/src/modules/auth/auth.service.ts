import crypto from "node:crypto";
import type { RegisterInput, LoginInput, UserDto } from "@coworkflow/types";
import type {
  IAuthRepository,
  IAuthService,
  AuthSessionResult,
  RefreshResult,
} from "./auth.types.js";
import { authRepository } from "./auth.repository.js";
import {
  hashPassword,
  verifyPassword,
  generateRawToken,
  hashToken,
} from "../../shared/utils/crypto.js";
import { generateAccessToken } from "../../shared/utils/jwt.js";
import { validatePasswordPolicy } from "../../shared/utils/password-policy.js";
import { ConflictError, UnauthorizedError, ForbiddenError } from "../../shared/errors/app-error.js";
import { prisma } from "../../prisma/client.js";

function toUserDto(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "MEMBER" | "ADMIN";
  status: "ACTIVE" | "DEACTIVATED";
  createdAt: Date;
  updatedAt: Date;
}): UserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class AuthService implements IAuthService {
  constructor(private readonly repo: IAuthRepository = authRepository) {}

  async register(input: RegisterInput): Promise<UserDto> {
    validatePasswordPolicy(input.password);

    const existingUser = await this.repo.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError(
        "An account with this email address already exists",
        "EMAIL_ALREADY_REGISTERED"
      );
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return toUserDto(user);
  }

  async login(input: LoginInput): Promise<AuthSessionResult> {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await verifyPassword(user.passwordHash, input.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status === "DEACTIVATED") {
      throw new ForbiddenError("Your account has been deactivated. Please contact support.");
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = generateRawToken();
    const tokenHash = hashToken(rawRefreshToken);
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    });

    return {
      accessToken,
      rawRefreshToken,
      user: toUserDto(user),
    };
  }

  async refresh(rawRefreshToken: string): Promise<RefreshResult> {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
      throw new UnauthorizedError("Refresh token is required");
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenRecord = await this.repo.findRefreshTokenByHash(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Breach detection: if token was already revoked or expired, revoke the entire token family
    if (tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      await this.repo.revokeTokenFamily(tokenRecord.familyId);
      throw new UnauthorizedError(
        "Invalid or reused refresh token. All sessions in this family have been revoked.",
        "SECURITY_BREACH"
      );
    }

    // Revoke current token
    await this.repo.revokeRefreshToken(tokenRecord.id);

    // Verify user account is still valid
    const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!user || user.status === "DEACTIVATED") {
      throw new UnauthorizedError("User account is inactive or not found");
    }

    // Mint new refresh token in the same family
    const newRawRefreshToken = generateRawToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.repo.createRefreshToken({
      userId: tokenRecord.userId,
      tokenHash: newTokenHash,
      familyId: tokenRecord.familyId,
      expiresAt,
    });

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const tokenRecord = await this.repo.findRefreshTokenByHash(tokenHash);
      if (tokenRecord && !tokenRecord.isRevoked) {
        await this.repo.revokeRefreshToken(tokenRecord.id);
      }
    }
  }
}

export const authService = new AuthService();
