"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReservationDto, ApiResponse, ReservationStatus } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AdminCancelModal } from "@/components/admin/AdminCancelModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatInterval, formatDuration } from "@/lib/date-utils";
import { Search } from "lucide-react";
import { clsx } from "clsx";

export default function AdminReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedForCancel, setSelectedForCancel] = useState<ReservationDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reservations", statusFilter],
    queryFn: () =>
      apiClient<ApiResponse<ReservationDto[]>>("/admin/reservations", {
        params: {
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          pageSize: 100,
        },
      }),
  });

  const reservations = data?.data || [];

  const filteredReservations = reservations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const spaceName = r.space?.name?.toLowerCase() || "";
    const memberName = `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.toLowerCase();
    const memberEmail = r.user?.email?.toLowerCase() || "";
    return spaceName.includes(q) || memberName.includes(q) || memberEmail.includes(q);
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
            Operational Schedule
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
            Master Reservations Ledger
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            View all member bookings across spaces, verify intervals, and resolve disputes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <Input
            placeholder="Search by space, member name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={clsx(
                "px-3 py-1.5 rounded-[6px] text-xs font-semibold uppercase tracking-wider border select-none cursor-pointer transition-colors",
                statusFilter === st
                  ? "bg-[var(--surface-dark)] text-white border-[var(--surface-dark)]"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)]"
              )}
            >
              {st === "ALL" ? "All Bookings" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Space</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Date & Interval</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredReservations.length > 0 ? (
                filteredReservations.map((res) => {
                  const isConfirmed = res.status === "CONFIRMED";

                  return (
                    <tr key={res.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                        <div className="font-semibold text-sm">
                          {res.space?.name || "Workspace"}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
                          {res.space?.type}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--text-primary)]">
                          {res.user?.firstName} {res.user?.lastName}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {res.user?.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--text-primary)]">
                          {formatDate(res.startAt)}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {formatInterval(res.startAt, res.endAt)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {formatDuration(res.startAt, res.endAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <ReservationPill
                          status={res.status === "CONFIRMED" ? "confirmed" : "cancelled"}
                          size="sm"
                        />
                        {res.cancellationReason && (
                          <div className="mt-1 text-[10px] text-[var(--terracotta-primary)] font-mono line-clamp-1 max-w-xs">
                            Reason: {res.cancellationReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isConfirmed && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedForCancel(res)}
                          >
                            Admin Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    No reservations found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin cancel modal */}
      {selectedForCancel && (
        <AdminCancelModal
          isOpen={!!selectedForCancel}
          onClose={() => setSelectedForCancel(null)}
          reservation={selectedForCancel}
        />
      )}
    </div>
  );
}
