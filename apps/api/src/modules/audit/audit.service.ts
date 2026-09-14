import type { AuditLogDto, AuditLogFilterQuery, PaginationMeta } from "@coworkflow/types";
import type { IAuditRepository, IAuditService, AuditLogWithActor } from "./audit.types.js";
import { auditRepository } from "./audit.repository.js";

function toAuditLogDto(log: AuditLogWithActor): AuditLogDto {
  return {
    id: log.id,
    actorUserId: log.actorUserId,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: (log.metadata as Record<string, unknown>) ?? {},
    correlationId: log.correlationId,
    createdAt: log.createdAt.toISOString(),
    actorUser: log.actorUser
      ? {
          id: log.actorUser.id,
          email: log.actorUser.email,
          firstName: log.actorUser.firstName,
          lastName: log.actorUser.lastName,
          role: log.actorUser.role,
          status: log.actorUser.status,
          createdAt: log.actorUser.createdAt.toISOString(),
          updatedAt: log.actorUser.updatedAt.toISOString(),
        }
      : null,
  };
}

export class AuditService implements IAuditService {
  constructor(private readonly repo: IAuditRepository = auditRepository) {}

  async emit(entry: {
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    correlationId: string;
  }): Promise<AuditLogDto> {
    const log = await this.repo.record(entry);
    return toAuditLogDto(log);
  }

  async listAuditLogs(
    query: AuditLogFilterQuery
  ): Promise<{ data: AuditLogDto[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      this.repo.findMany(query, skip, pageSize),
      this.repo.count(query),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: logs.map(toAuditLogDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }
}

export const auditService = new AuditService();
