import type { Reservation, Space, User } from "@prisma/client";
import type {
  CreateReservationInput,
  ReservationDto,
  ReservationFilterQuery,
  PaginationMeta,
  UserRole,
} from "@coworkflow/types";

export interface ReservationWithRelations extends Reservation {
  space: Space;
  user: User;
}

export interface IReservationsRepository {
  create(data: {
    userId: string;
    spaceId: string;
    startAt: Date;
    endAt: Date;
    purpose?: string;
  }): Promise<ReservationWithRelations>;
  findById(id: string): Promise<ReservationWithRelations | null>;
  findByUser(
    userId: string,
    filters: ReservationFilterQuery,
    skip: number,
    take: number
  ): Promise<ReservationWithRelations[]>;
  countByUser(userId: string, filters: ReservationFilterQuery): Promise<number>;
  cancel(id: string, cancelledByUserId: string): Promise<ReservationWithRelations>;
}

export interface IReservationsService {
  createReservation(
    userId: string,
    input: CreateReservationInput
  ): Promise<ReservationDto>;
  getReservationById(
    userId: string,
    userRole: UserRole,
    reservationId: string
  ): Promise<ReservationDto>;
  listMemberReservations(
    userId: string,
    query: ReservationFilterQuery
  ): Promise<{ data: ReservationDto[]; meta: PaginationMeta }>;
  cancelReservation(
    userId: string,
    userRole: UserRole,
    reservationId: string
  ): Promise<ReservationDto>;
}
