// ============================================================================
// Core Domain Enums
// ============================================================================

export type UserRole = "MEMBER" | "ADMIN";
export const UserRole = {
  MEMBER: "MEMBER" as const,
  ADMIN: "ADMIN" as const,
};

export type UserStatus = "ACTIVE" | "DEACTIVATED";
export const UserStatus = {
  ACTIVE: "ACTIVE" as const,
  DEACTIVATED: "DEACTIVATED" as const,
};

export type LocationStatus = "ACTIVE" | "INACTIVE";
export const LocationStatus = {
  ACTIVE: "ACTIVE" as const,
  INACTIVE: "INACTIVE" as const,
};

export type SpaceType = "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
export const SpaceType = {
  DESK: "DESK" as const,
  MEETING_ROOM: "MEETING_ROOM" as const,
  PRIVATE_OFFICE: "PRIVATE_OFFICE" as const,
};

export type SpaceStatus = "ACTIVE" | "INACTIVE";
export const SpaceStatus = {
  ACTIVE: "ACTIVE" as const,
  INACTIVE: "INACTIVE" as const,
};

export type ReservationStatus = "CONFIRMED" | "CANCELLED";
export const ReservationStatus = {
  CONFIRMED: "CONFIRMED" as const,
  CANCELLED: "CANCELLED" as const,
};

// ============================================================================
// Domain Entities
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  timezone: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  locationId: string;
  name: string;
  type: SpaceType;
  capacity: number;
  description: string | null;
  amenities: string[];
  status: SpaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  spaceId: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  purpose: string | null;
  cancelledAt: string | null;
  cancelledByUserId: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  correlationId: string;
  createdAt: string;
}

// ============================================================================
// API Response Contracts & Standard Envelopes
// ============================================================================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorIssue {
  field?: string;
  issue: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId: string;
  details?: ApiErrorIssue[];
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

// ============================================================================
// Health & Operational Contracts (FR-HEALTH-001)
// ============================================================================

export interface HealthResponse {
  status: "ok";
  uptime: number;
  timestamp: string;
}

export interface ReadyResponse {
  status: "ready" | "unavailable";
  database: "connected" | "disconnected";
  error?: string;
}

// ============================================================================
// Auth & User DTOs
// ============================================================================

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
}

// ============================================================================
// Space & Availability DTOs
// ============================================================================

export interface SpaceDto extends Space {
  location?: Location;
}

export interface SpaceFilterQuery {
  type?: SpaceType;
  minCapacity?: number;
  amenities?: string[];
  status?: SpaceStatus;
  page?: number;
  pageSize?: number;
}

export interface TimeIntervalDto {
  startAt: string;
  endAt: string;
}

export interface SpaceAvailabilityResponse {
  spaceId: string;
  intervals: TimeIntervalDto[];
}

// ============================================================================
// Reservation DTOs
// ============================================================================

export interface CreateReservationInput {
  spaceId: string;
  startAt: string;
  endAt: string;
  purpose?: string;
}

export interface ReservationDto extends Reservation {
  space?: SpaceDto;
  user?: UserDto;
}

export interface ReservationFilterQuery {
  status?: ReservationStatus;
  page?: number;
  pageSize?: number;
}
