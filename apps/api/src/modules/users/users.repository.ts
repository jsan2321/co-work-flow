import { prisma } from "../../prisma/client.js";
import type { User } from "@prisma/client";
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
}

export const usersRepository = new UsersRepository();
