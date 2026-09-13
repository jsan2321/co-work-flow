import type { User } from "@prisma/client";
import type { UserDto, UpdateProfileInput } from "@coworkflow/types";

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  update(id: string, data: { firstName?: string; lastName?: string }): Promise<User>;
}

export interface IUsersService {
  getProfile(userId: string): Promise<UserDto>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDto>;
}
