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
  create(data: {
    locationId: string;
    name: string;
    type: "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
    capacity: number;
    description?: string;
    amenities?: string[];
  }): Promise<SpaceWithLocation>;
  update(
    id: string,
    data: {
      locationId?: string;
      name?: string;
      type?: "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
      capacity?: number;
      description?: string;
      amenities?: string[];
    }
  ): Promise<SpaceWithLocation>;
  updateStatus(
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<SpaceWithLocation>;
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
  createSpace(
    adminUserId: string,
    correlationId: string,
    input: {
      locationId: string;
      name: string;
      type: "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
      capacity: number;
      description?: string;
      amenities?: string[];
    }
  ): Promise<SpaceDto>;
  updateSpace(
    adminUserId: string,
    correlationId: string,
    id: string,
    input: {
      locationId?: string;
      name?: string;
      type?: "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
      capacity?: number;
      description?: string;
      amenities?: string[];
    }
  ): Promise<SpaceDto>;
  updateSpaceStatus(
    adminUserId: string,
    correlationId: string,
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<SpaceDto>;
}
