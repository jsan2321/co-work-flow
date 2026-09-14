import type { User } from "@prisma/client";
import type {
  UserDto,
  UpdateProfileInput,
  AdminUserFilterQuery,
  UserStatus,
  PaginationMeta,
} from "@coworkflow/types";

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  update(id: string, data: { firstName?: string; lastName?: string }): Promise<User>;
  findManyWithFilters(
    filters: AdminUserFilterQuery,
    skip: number,
    take: number
  ): Promise<User[]>;
  countWithFilters(filters: AdminUserFilterQuery): Promise<number>;
  updateStatus(id: string, status: UserStatus): Promise<User>;
  revokeUserRefreshTokens(userId: string): Promise<number>;
}

export interface IUsersService {
  getProfile(userId: string): Promise<UserDto>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDto>;
  adminListUsers(
    query: AdminUserFilterQuery
  ): Promise<{ data: UserDto[]; meta: PaginationMeta }>;
  updateUserStatus(
    adminUserId: string,
    correlationId: string,
    targetUserId: string,
    status: UserStatus
  ): Promise<UserDto>;
}

