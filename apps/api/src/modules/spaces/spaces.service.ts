import type { SpaceFilterQuery, SpaceDto, TimeIntervalDto, PaginationMeta } from "@coworkflow/types";
import type { ISpacesRepository, ISpacesService, SpaceWithLocation } from "./spaces.types.js";
import { spacesRepository } from "./spaces.repository.js";
import { locationsService, LocationsService } from "../locations/locations.service.js";
import { auditService, AuditService } from "../audit/audit.service.js";
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
  constructor(
    private readonly repo: ISpacesRepository = spacesRepository,
    private readonly locations: LocationsService = locationsService,
    private readonly audit: AuditService = auditService
  ) {}

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

  async createSpace(
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
  ): Promise<SpaceDto> {
    const location = await this.locations.getLocationById(input.locationId);
    if (!location || location.status !== "ACTIVE") {
      throw new NotFoundError("Location not found or inactive");
    }

    const space = await this.repo.create(input);

    await this.audit.emit({
      actorUserId: adminUserId,
      action: "SPACE_CREATED",
      entityType: "SPACE",
      entityId: space.id,
      metadata: {
        name: space.name,
        type: space.type,
        capacity: space.capacity,
        locationId: space.locationId,
      },
      correlationId,
    });

    return toSpaceDto(space);
  }

  async updateSpace(
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
  ): Promise<SpaceDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("Space not found");
    }

    if (input.locationId) {
      const location = await this.locations.getLocationById(input.locationId);
      if (!location || location.status !== "ACTIVE") {
        throw new NotFoundError("Location not found or inactive");
      }
    }

    const updated = await this.repo.update(id, input);

    await this.audit.emit({
      actorUserId: adminUserId,
      action: "SPACE_UPDATED",
      entityType: "SPACE",
      entityId: updated.id,
      metadata: {
        updatedFields: Object.keys(input),
      },
      correlationId,
    });

    return toSpaceDto(updated);
  }

  async updateSpaceStatus(
    adminUserId: string,
    correlationId: string,
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<SpaceDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("Space not found");
    }

    const updated = await this.repo.updateStatus(id, status);

    await this.audit.emit({
      actorUserId: adminUserId,
      action: "SPACE_STATUS_CHANGED",
      entityType: "SPACE",
      entityId: updated.id,
      metadata: {
        previousStatus: existing.status,
        newStatus: status,
      },
      correlationId,
    });

    return toSpaceDto(updated);
  }
}

export const spacesService = new SpacesService();
