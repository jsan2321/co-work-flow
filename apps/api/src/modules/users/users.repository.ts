import { prisma } from "../../prisma/client.js";
import type { User, Prisma } from "@prisma/client";
import type { AdminUserFilterQuery, UserStatus } from "@coworkflow/types";
import type { IUsersRepository } from "./users.types.js";

export class UsersRepository implements IUsersRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  private buildWhereClause(filters: AdminUserFilterQuery): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async findManyWithFilters(
    filters: AdminUserFilterQuery,
    skip: number,
    take: number
  ): Promise<User[]> {
    const where = this.buildWhereClause(filters);
    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async countWithFilters(filters: AdminUserFilterQuery): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.user.count({ where });
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async revokeUserRefreshTokens(userId: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
    return result.count;
  }
}

export const usersRepository = new UsersRepository();
