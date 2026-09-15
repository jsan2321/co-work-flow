import type {
  CreateReservationInput,
  ReservationDto,
  ReservationFilterQuery,
  AdminReservationFilterQuery,
  PaginationMeta,
  UserRole,
} from "@coworkflow/types";
import type {
  IReservationsRepository,
  IReservationsService,
  ReservationWithRelations,
} from "./reservations.types.js";
import { reservationsRepository } from "./reservations.repository.js";
import { spacesService, SpacesService } from "../spaces/spaces.service.js";
import { auditService, AuditService } from "../audit/audit.service.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../../shared/errors/app-error.js";

function toReservationDto(res: ReservationWithRelations): ReservationDto {
  const spaceLocation = (
    res.space as unknown as {
      location?: {
        id: string;
        name: string;
        address: string;
        timezone: string;
        status: "ACTIVE" | "INACTIVE";
        createdAt: Date;
        updatedAt: Date;
      };
    }
  ).location;

  return {
    id: res.id,
    userId: res.userId,
    spaceId: res.spaceId,
    startAt: res.startAt.toISOString(),
    endAt: res.endAt.toISOString(),
    status: res.status,
    purpose: res.purpose,
    cancelledAt: res.cancelledAt ? res.cancelledAt.toISOString() : null,
    cancelledByUserId: res.cancelledByUserId,
    cancellationReason: res.cancellationReason,
    createdAt: res.createdAt.toISOString(),
    updatedAt: res.updatedAt.toISOString(),
    space: res.space
      ? {
          id: res.space.id,
          locationId: res.space.locationId,
          name: res.space.name,
          type: res.space.type,
          capacity: res.space.capacity,
          description: res.space.description,
          amenities: res.space.amenities,
          status: res.space.status,
          createdAt: res.space.createdAt.toISOString(),
          updatedAt: res.space.updatedAt.toISOString(),
          location: spaceLocation
            ? {
                id: spaceLocation.id,
                name: spaceLocation.name,
                address: spaceLocation.address,
                timezone: spaceLocation.timezone,
                status: spaceLocation.status,
                createdAt: spaceLocation.createdAt.toISOString(),
                updatedAt: spaceLocation.updatedAt.toISOString(),
              }
            : undefined,
        }
      : undefined,
    user: res.user
      ? {
          id: res.user.id,
          email: res.user.email,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          role: res.user.role,
          status: res.user.status,
          createdAt: res.user.createdAt.toISOString(),
          updatedAt: res.user.updatedAt.toISOString(),
        }
      : undefined,
  };
}

export class ReservationsService implements IReservationsService {
  constructor(
    private readonly repo: IReservationsRepository = reservationsRepository,
    private readonly spaces: SpacesService = spacesService,
    private readonly audit: AuditService = auditService
  ) {}

  async createReservation(userId: string, input: CreateReservationInput): Promise<ReservationDto> {
    const space = await this.spaces.getActiveSpaceById(input.spaceId);
    if (!space) {
      throw new NotFoundError("Space not found or unavailable");
    }

    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (startAt.getTime() <= Date.now()) {
      throw new ValidationError("Reservation startAt must be in the future");
    }

    if (endAt.getTime() <= startAt.getTime()) {
      throw new ValidationError("Reservation endAt must be strictly after startAt");
    }

    const durationMs = endAt.getTime() - startAt.getTime();
    if (durationMs < 30 * 60 * 1000) {
      throw new ValidationError("Reservation duration must be at least 30 minutes");
    }

    if (durationMs > 8 * 60 * 60 * 1000) {
      throw new ValidationError("Reservation duration cannot exceed 8 hours");
    }

    const reservation = await this.repo.create({
      userId,
      spaceId: input.spaceId,
      startAt,
      endAt,
      purpose: input.purpose,
    });

    return toReservationDto(reservation);
  }

  async getReservationById(
    userId: string,
    userRole: UserRole,
    reservationId: string
  ): Promise<ReservationDto> {
    const reservation = await this.repo.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    if (userRole !== "ADMIN" && reservation.userId !== userId) {
      throw new NotFoundError("Reservation not found");
    }

    return toReservationDto(reservation);
  }

  async listMemberReservations(
    userId: string,
    query: ReservationFilterQuery
  ): Promise<{ data: ReservationDto[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [reservations, total] = await Promise.all([
      this.repo.findByUser(userId, query, skip, pageSize),
      this.repo.countByUser(userId, query),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: reservations.map(toReservationDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async cancelReservation(
    userId: string,
    userRole: UserRole,
    reservationId: string
  ): Promise<ReservationDto> {
    const reservation = await this.repo.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    if (userRole !== "ADMIN" && reservation.userId !== userId) {
      throw new NotFoundError("Reservation not found");
    }

    if (reservation.status === "CANCELLED") {
      return toReservationDto(reservation);
    }

    if (userRole !== "ADMIN") {
      const oneHourBeforeStart = reservation.startAt.getTime() - 60 * 60 * 1000;
      if (Date.now() >= oneHourBeforeStart) {
        throw new ForbiddenError(
          "Reservations cannot be cancelled within 1 hour of the start time.",
          "CANCELLATION_WINDOW_CLOSED"
        );
      }
    }

    const cancelled = await this.repo.cancel(reservationId, userId);
    return toReservationDto(cancelled);
  }

  async adminListReservations(
    query: AdminReservationFilterQuery
  ): Promise<{ data: ReservationDto[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [reservations, total] = await Promise.all([
      this.repo.findAdminMany(query, skip, pageSize),
      this.repo.countAdmin(query),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: reservations.map(toReservationDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async adminCancelReservation(
    adminUserId: string,
    correlationId: string,
    reservationId: string,
    reason: string
  ): Promise<ReservationDto> {
    const reservation = await this.repo.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    if (reservation.status === "CANCELLED") {
      return toReservationDto(reservation);
    }

    const cancelled = await this.repo.cancel(reservationId, adminUserId, reason);

    await this.audit.emit({
      actorUserId: adminUserId,
      action: "RESERVATION_CANCELLED_BY_ADMIN",
      entityType: "RESERVATION",
      entityId: reservationId,
      metadata: {
        oldState: {
          status: reservation.status,
          startAt: reservation.startAt.toISOString(),
          endAt: reservation.endAt.toISOString(),
        },
        newState: {
          status: cancelled.status,
          cancellationReason: reason,
          cancelledByUserId: adminUserId,
          cancelledAt: cancelled.cancelledAt?.toISOString(),
        },
      },
      correlationId,
    });

    return toReservationDto(cancelled);
  }
}

export const reservationsService = new ReservationsService();
