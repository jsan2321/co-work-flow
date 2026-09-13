import type { UserDto, UpdateProfileInput } from "@coworkflow/types";
import type { IUsersRepository, IUsersService } from "./users.types.js";
import { usersRepository } from "./users.repository.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

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
  constructor(private readonly repo: IUsersRepository = usersRepository) {}

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
}

export const usersService = new UsersService();
