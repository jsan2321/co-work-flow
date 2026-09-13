import { prisma } from "../../prisma/client.js";
import type { Prisma } from "@prisma/client";
import type { SpaceFilterQuery } from "@coworkflow/types";
import type { ISpacesRepository, SpaceWithLocation, ConfirmedInterval } from "./spaces.types.js";

export class SpacesRepository implements ISpacesRepository {
  private buildWhereClause(filters: SpaceFilterQuery): Prisma.SpaceWhereInput {
    const where: Prisma.SpaceWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.minCapacity !== undefined) {
      where.capacity = { gte: filters.minCapacity };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.amenities && filters.amenities.length > 0) {
      where.amenities = {
        hasEvery: filters.amenities,
      };
    }

    return where;
  }

  async findMany(
    filters: SpaceFilterQuery,
    skip: number,
    take: number
  ): Promise<SpaceWithLocation[]> {
    const where = this.buildWhereClause(filters);
    return prisma.space.findMany({
      where,
      skip,
      take,
      include: {
        location: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async count(filters: SpaceFilterQuery): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.space.count({ where });
  }

  async findById(id: string): Promise<SpaceWithLocation | null> {
    return prisma.space.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });
  }

  async getConfirmedReservationIntervals(
    spaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ConfirmedInterval[]> {
    // Half-open interval intersection [start_at, end_at) with [startDate, endDate)
    // Overlaps if and only if start_at < endDate AND end_at > startDate
    const reservations = await prisma.reservation.findMany({
      where: {
        spaceId,
        status: "CONFIRMED",
        startAt: { lt: endDate },
        endAt: { gt: startDate },
      },
      select: {
        startAt: true,
        endAt: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return reservations;
  }
}

export const spacesRepository = new SpacesRepository();
