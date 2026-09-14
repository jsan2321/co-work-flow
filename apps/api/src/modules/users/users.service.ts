import type {
  UserDto,
  UpdateProfileInput,
  AdminUserFilterQuery,
  UserStatus,
  PaginationMeta,
} from "@coworkflow/types";
import type { IUsersRepository, IUsersService } from "./users.types.js";
import { usersRepository } from "./users.repository.js";
import { auditService, AuditService } from "../audit/audit.service.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../../shared/errors/app-error.js";

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

export class UsersService implements IUsersService {
  constructor(
    private readonly repo: IUsersRepository = usersRepository,
    private readonly audit: AuditService = auditService
  ) {}

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toUserDto(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDto> {
    const existing = await this.repo.findById(userId);
    if (!existing) {
      throw new NotFoundError("User not found");
    }

    const updated = await this.repo.update(userId, {
      ...(input.firstName !== undefined && { firstName: input.firstName.trim() }),
      ...(input.lastName !== undefined && { lastName: input.lastName.trim() }),
    });

    return toUserDto(updated);
  }

  async adminListUsers(
    query: AdminUserFilterQuery
  ): Promise<{ data: UserDto[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      this.repo.findManyWithFilters(query, skip, pageSize),
      this.repo.countWithFilters(query),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: users.map(toUserDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async updateUserStatus(
    adminUserId: string,
    correlationId: string,
    targetUserId: string,
    status: UserStatus
  ): Promise<UserDto> {
    if (adminUserId === targetUserId && status === "DEACTIVATED") {
      throw new ForbiddenError(
        "Administrators cannot deactivate their own account",
        "CANNOT_DEACTIVATE_SELF"
      );
    }

    const existing = await this.repo.findById(targetUserId);
    if (!existing) {
      throw new NotFoundError("User not found");
    }

    if (existing.status === status) {
      return toUserDto(existing);
    }

    if (status === "DEACTIVATED") {
      await this.repo.revokeUserRefreshTokens(targetUserId);
    }

    const updated = await this.repo.updateStatus(targetUserId, status);

    await this.audit.emit({
      actorUserId: adminUserId,
      action: "USER_STATUS_CHANGED",
      entityType: "USER",
      entityId: targetUserId,
      metadata: {
        oldState: {
          status: existing.status,
        },
        newState: {
          status: updated.status,
        },
      },
      correlationId,
    });

    return toUserDto(updated);
  }
}

export const usersService = new UsersService();
