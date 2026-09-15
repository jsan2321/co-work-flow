import type { AuditLog, User } from "@prisma/client";
import type { AuditLogDto, AuditLogFilterQuery, PaginationMeta } from "@coworkflow/types";

export interface AuditLogWithActor extends AuditLog {
  actorUser?: User | null;
}

export interface IAuditRepository {
  record(entry: {
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    correlationId: string;
  }): Promise<AuditLogWithActor>;

  findMany(filters: AuditLogFilterQuery, skip: number, take: number): Promise<AuditLogWithActor[]>;

  count(filters: AuditLogFilterQuery): Promise<number>;
}

export interface IAuditService {
  emit(entry: {
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    correlationId: string;
  }): Promise<AuditLogDto>;

  listAuditLogs(query: AuditLogFilterQuery): Promise<{ data: AuditLogDto[]; meta: PaginationMeta }>;
}
