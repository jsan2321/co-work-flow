import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { ReservationConflictError } from "../../shared/errors/app-error.js";
import type { ReservationFilterQuery } from "@coworkflow/types";
import type { IReservationsRepository, ReservationWithRelations } from "./reservations.types.js";

export class ReservationsRepository implements IReservationsRepository {
  async create(data: {
    userId: string;
    spaceId: string;
    startAt: Date;
    endAt: Date;
    purpose?: string;
  }): Promise<ReservationWithRelations> {
    try {
      return await prisma.reservation.create({
        data: {
          userId: data.userId,
          spaceId: data.spaceId,
          startAt: data.startAt,
          endAt: data.endAt,
          purpose: data.purpose,
          status: "CONFIRMED",
        },
        include: {
          space: {
            include: {
              location: true,
            },
          },
          user: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message || "";
        const code = (error as { code?: string }).code;
        if (
          code === "P2010" ||
          code === "P2002" ||
          msg.includes("23P01") ||
          msg.includes("reservation_no_overlap") ||
          msg.includes("exclusion_violation") ||
          msg.includes("40P01") ||
          msg.includes("deadlock detected")
        ) {
          throw new ReservationConflictError();
        }
      }
      throw error;
    }
  }

  async findById(id: string): Promise<ReservationWithRelations | null> {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        space: {
          include: {
            location: true,
          },
        },
        user: true,
      },
    });
  }

  async findByUser(
    userId: string,
    filters: ReservationFilterQuery,
    skip: number,
    take: number
  ): Promise<ReservationWithRelations[]> {
    const where: Prisma.ReservationWhereInput = {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
    };

    return prisma.reservation.findMany({
      where,
      skip,
      take,
      orderBy: { startAt: "desc" },
      include: {
        space: {
          include: {
            location: true,
          },
        },
        user: true,
      },
    });
  }

  async countByUser(userId: string, filters: ReservationFilterQuery): Promise<number> {
    const where: Prisma.ReservationWhereInput = {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
    };

    return prisma.reservation.count({ where });
  }

  async cancel(id: string, cancelledByUserId: string): Promise<ReservationWithRelations> {
    return prisma.reservation.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledByUserId,
        cancellationReason: "Cancelled by user",
      },
      include: {
        space: {
          include: {
            location: true,
          },
        },
        user: true,
      },
    });
  }
}

export const reservationsRepository = new ReservationsRepository();
