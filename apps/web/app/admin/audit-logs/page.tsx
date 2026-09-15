"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuditLogDto, ApiResponse } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatTime } from "@/lib/date-utils";
import { Code2 } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [selectedMetadata, setSelectedMetadata] = useState<{
    action: string;
    metadata: Record<string, unknown>;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs", entityTypeFilter],
    queryFn: () =>
      apiClient<ApiResponse<AuditLogDto[]>>("/admin/audit-logs", {
        params: {
          entityType: entityTypeFilter || undefined,
          pageSize: 50,
        },
      }),
  });

  const auditLogs = data?.data || [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
            Compliance & Security
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
            Immutable Audit Ledger
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Cryptographically sealed, append-only records of all administrative actions and security
            events.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs w-full">
          <Input
            placeholder="Filter by entity type (Space, Reservation, User)..."
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          Total Records:{" "}
          <strong className="text-[var(--text-primary)] font-semibold">{auditLogs.length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Entity</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Correlation ID</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                    <td className="py-3.5 px-4 text-[var(--text-primary)]">
                      <div className="font-medium">{formatDate(log.createdAt)}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {formatTime(log.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[var(--surface-muted)] text-[var(--text-primary)] font-mono text-[11px] font-semibold border border-[var(--border-default)]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-[var(--text-primary)] font-semibold">
                        {log.entityType}
                      </span>
                      <span className="text-[var(--text-muted)] block text-[10px]">
                        ID: {log.entityId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {log.actorUser ? (
                        <div>
                          <span className="text-[var(--text-primary)] font-medium">
                            {log.actorUser.firstName} {log.actorUser.lastName}
                          </span>
                          <span className="block text-[10px] text-[var(--text-muted)]">
                            {log.actorUser.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] italic">System</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                      {log.correlationId}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedMetadata({
                              action: log.action,
                              metadata: log.metadata,
                            })
                          }
                          title="View metadata payload"
                        >
                          <Code2 className="w-3.5 h-3.5 mr-1 text-[var(--teal-primary)]" />
                          <span>JSON</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    No audit records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Viewer Dialog */}
      {selectedMetadata && (
        <Dialog
          isOpen={!!selectedMetadata}
          onClose={() => setSelectedMetadata(null)}
          title={`Audit Payload: ${selectedMetadata.action}`}
          description="Cryptographic record details stored in immutable audit ledger"
          maxWidth="md"
        >
          <div className="space-y-4 font-sans">
            <pre className="p-4 rounded-[6px] bg-[var(--surface-dark)] text-[#A7B3A5] font-mono text-xs overflow-x-auto leading-relaxed border border-[var(--border-strong)]">
              {JSON.stringify(selectedMetadata.metadata, null, 2)}
            </pre>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="md" onClick={() => setSelectedMetadata(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
