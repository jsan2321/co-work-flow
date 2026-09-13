import type { User, RefreshToken } from "@prisma/client";
import type { RegisterInput, LoginInput, UserDto } from "@coworkflow/types";

export interface AuthSessionResult {
  accessToken: string;
  rawRefreshToken: string;
  user: UserDto;
}

export interface RefreshResult {
  accessToken: string;
  newRawRefreshToken: string;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;
  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeRefreshToken(id: string): Promise<void>;
  revokeTokenFamily(familyId: string): Promise<void>;
}

export interface IAuthService {
  register(input: RegisterInput): Promise<UserDto>;
  login(input: LoginInput): Promise<AuthSessionResult>;
  refresh(rawRefreshToken: string): Promise<RefreshResult>;
  logout(rawRefreshToken?: string): Promise<void>;
}
