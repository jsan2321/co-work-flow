import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import type { AuditLogFilterQuery } from "@coworkflow/types";
import type { IAuditRepository, AuditLogWithActor } from "./audit.types.js";

export class AuditRepository implements IAuditRepository {
  async record(entry: {
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    correlationId: string;
  }): Promise<AuditLogWithActor> {
    return prisma.auditLog.create({
      data: {
        actorUserId: entry.actorUserId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: (entry.metadata ?? {}) as Prisma.InputJsonValue,
        correlationId: entry.correlationId,
      },
      include: {
        actorUser: true,
      },
    });
  }

  async findMany(
    filters: AuditLogFilterQuery,
    skip: number,
    take: number
  ): Promise<AuditLogWithActor[]> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.actorUserId) {
      where.actorUserId = filters.actorUserId;
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.createdAt.lte = new Date(filters.to);
      }
    }

    return prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        actorUser: true,
      },
    });
  }

  async count(filters: AuditLogFilterQuery): Promise<number> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.actorUserId) {
      where.actorUserId = filters.actorUserId;
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.createdAt.lte = new Date(filters.to);
      }
    }

    return prisma.auditLog.count({ where });
  }
}

export const auditRepository = new AuditRepository();
