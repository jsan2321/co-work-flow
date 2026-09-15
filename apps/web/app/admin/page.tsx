"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, AdminDashboardMetrics } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime } from "@/lib/date-utils";
import { Building2, CalendarDays, Clock, ArrowRight, TrendingUp } from "lucide-react";

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiClient<ApiResponse<AdminDashboardMetrics>>("/admin/dashboard"),
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const metrics = data?.data;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
              Live Telemetry
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Operational Overview
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Real-time space occupancy, incoming 24-hour demand, and audit ledger activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/spaces">
            <Button variant="secondary" size="sm">
              Manage Spaces
            </Button>
          </Link>
          <Link href="/admin/reservations">
            <Button variant="primary" size="sm">
              View Schedule Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[8px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Active Spaces
              </span>
              <Building2 className="w-4 h-4 text-[var(--gold-primary)]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-2">
              {metrics?.totalActiveSpaces ?? 0}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-sans">
              Total capacity: {metrics?.totalCapacity ?? 0} seats
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Today&apos;s Bookings
              </span>
              <CalendarDays className="w-4 h-4 text-[var(--teal-primary)]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-2">
              {metrics?.todayReservationsCount ?? 0}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-sans">
              Active sessions today
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Upcoming 24h
              </span>
              <Clock className="w-4 h-4 text-[var(--gold-primary)]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-2">
              {metrics?.upcoming24hReservationsCount ?? 0}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-sans">
              Confirmed next 24 hours
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Utilization Rate
              </span>
              <TrendingUp className="w-4 h-4 text-[var(--teal-primary)]" />
            </div>
            <p className="font-serif text-3xl font-bold text-[var(--text-primary)] mt-2">
              {metrics?.todayUtilizationPercentage ?? 0}%
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-sans">
              Daily capacity load
            </p>
          </Card>
        </div>
      )}

      {/* Recent Audit Ledger Feed */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
              Security & Operations
            </span>
            <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
              Recent Immutable Audit Activity
            </h3>
          </div>
          <Link href="/admin/audit-logs">
            <Button variant="ghost" size="sm">
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 ? (
            <div className="divide-y divide-[var(--border-default)] text-xs font-sans">
              {metrics.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-[4px] bg-[var(--surface-muted)] text-[var(--text-primary)] font-mono text-[10px] font-bold border border-[var(--border-default)]">
                      {log.action}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {log.entityType} •{" "}
                      <span className="font-mono text-[var(--text-primary)] text-[11px]">
                        {log.entityId.substring(0, 8)}...
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[var(--text-muted)] text-[11px]">
                    <span className="font-mono">{log.correlationId}</span>
                    <span>{formatTime(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">
              No audit records recorded yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
