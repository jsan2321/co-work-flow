import type { Space, Location } from "@prisma/client";
import type { SpaceFilterQuery, SpaceDto, TimeIntervalDto, PaginationMeta } from "@coworkflow/types";

export interface SpaceWithLocation extends Space {
  location: Location;
}

export interface ConfirmedInterval {
  startAt: Date;
  endAt: Date;
}

export interface ISpacesRepository {
  findMany(
    filters: SpaceFilterQuery,
    skip: number,
    take: number
  ): Promise<SpaceWithLocation[]>;
  count(filters: SpaceFilterQuery): Promise<number>;
  findById(id: string): Promise<SpaceWithLocation | null>;
  getConfirmedReservationIntervals(
    spaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ConfirmedInterval[]>;
}

export interface ISpacesService {
  listSpaces(
    query: SpaceFilterQuery
  ): Promise<{ data: SpaceDto[]; meta: PaginationMeta }>;
  getSpaceById(id: string): Promise<SpaceDto>;
  getActiveSpaceById(id: string): Promise<SpaceDto | null>;
  getAvailability(
    spaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ spaceId: string; intervals: TimeIntervalDto[] }>;
}
