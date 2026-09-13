import type { SpaceFilterQuery, SpaceDto, TimeIntervalDto, PaginationMeta } from "@coworkflow/types";
import type { ISpacesRepository, ISpacesService, SpaceWithLocation } from "./spaces.types.js";
import { spacesRepository } from "./spaces.repository.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

function toSpaceDto(space: SpaceWithLocation): SpaceDto {
  return {
    id: space.id,
    locationId: space.locationId,
    name: space.name,
    type: space.type,
    capacity: space.capacity,
    description: space.description,
    amenities: space.amenities,
    status: space.status,
    createdAt: space.createdAt.toISOString(),
    updatedAt: space.updatedAt.toISOString(),
    location: {
      id: space.location.id,
      name: space.location.name,
      address: space.location.address,
      timezone: space.location.timezone,
      status: space.location.status,
      createdAt: space.location.createdAt.toISOString(),
      updatedAt: space.location.updatedAt.toISOString(),
    },
  };
}

export class SpacesService implements ISpacesService {
  constructor(private readonly repo: ISpacesRepository = spacesRepository) {}

  async listSpaces(
    query: SpaceFilterQuery
  ): Promise<{ data: SpaceDto[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [spaces, total] = await Promise.all([
      this.repo.findMany(query, skip, pageSize),
      this.repo.count(query),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: spaces.map(toSpaceDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async getSpaceById(id: string): Promise<SpaceDto> {
    const space = await this.repo.findById(id);
    if (!space) {
      throw new NotFoundError("Space not found");
    }
    return toSpaceDto(space);
  }

  async getActiveSpaceById(id: string): Promise<SpaceDto | null> {
    const space = await this.repo.findById(id);
    if (!space || space.status !== "ACTIVE") {
      return null;
    }
    return toSpaceDto(space);
  }

  async getAvailability(
    spaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ spaceId: string; intervals: TimeIntervalDto[] }> {
    const space = await this.repo.findById(spaceId);
    if (!space) {
      throw new NotFoundError("Space not found");
    }

    const intervals = await this.repo.getConfirmedReservationIntervals(
      spaceId,
      startDate,
      endDate
    );

    return {
      spaceId,
      intervals: intervals.map((i) => ({
        startAt: i.startAt.toISOString(),
        endAt: i.endAt.toISOString(),
      })),
    };
  }
}

export const spacesService = new SpacesService();
