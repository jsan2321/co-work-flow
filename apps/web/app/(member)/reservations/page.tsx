"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReservationDto, ApiResponse } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { CancelReservationModal } from "@/components/reservations/CancelReservationModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatInterval, formatDuration } from "@/lib/date-utils";
import { Calendar, Clock, Building2, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

export default function ReservationsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedForCancel, setSelectedForCancel] = useState<ReservationDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => apiClient<ApiResponse<ReservationDto[]>>("/reservations"),
  });

  const reservations = data?.data || [];
  const now = Date.now();

  const upcomingReservations = reservations
    .filter((r) => r.status === "CONFIRMED" && new Date(r.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const pastReservations = reservations
    .filter((r) => r.status === "CANCELLED" || new Date(r.endAt).getTime() <= now)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const currentList = tab === "upcoming" ? upcomingReservations : pastReservations;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)] mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
            Member Itinerary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            My Reservations
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
            View scheduled sessions, active workspace claims, and cancellation history.
          </p>
        </div>

        <Link href="/spaces">
          <Button variant="primary" size="md">
            <span>Book New Workspace</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-default)] pb-1">
        <button
          type="button"
          onClick={() => setTab("upcoming")}
          className={clsx(
            "px-4 py-2 text-xs font-semibold rounded-[6px] transition-colors border select-none cursor-pointer flex items-center gap-2",
            tab === "upcoming"
              ? "bg-[var(--surface-dark)] text-white border-[var(--surface-dark)]"
              : "bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          )}
        >
          <span>Upcoming Bookings</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--surface-muted)] text-[var(--text-primary)] text-[10px] font-mono">
            {upcomingReservations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("past")}
          className={clsx(
            "px-4 py-2 text-xs font-semibold rounded-[6px] transition-colors border select-none cursor-pointer flex items-center gap-2",
            tab === "past"
              ? "bg-[var(--surface-dark)] text-white border-[var(--surface-dark)]"
              : "bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          )}
        >
          <span>Past & Cancelled</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--surface-muted)] text-[var(--text-primary)] text-[10px] font-mono">
            {pastReservations.length}
          </span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!isLoading && currentList.length > 0 && (
        <div className="space-y-4">
          {currentList.map((res) => {
            const isConfirmed = res.status === "CONFIRMED";
            const isUpcoming = new Date(res.endAt).getTime() > now;

            return (
              <div
                key={res.id}
                className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] p-6 transition-colors hover:border-[var(--border-strong)] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[var(--gold-primary)]">
                      {res.space?.type}
                    </span>
                    <span>•</span>
                    <ReservationPill
                      status={res.status === "CONFIRMED" ? "confirmed" : "cancelled"}
                      size="sm"
                    />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                    {res.space?.name || "Workspace"}
                  </h3>

                  {res.purpose && (
                    <p className="text-xs text-[var(--text-secondary)] italic">
                      &ldquo;{res.purpose}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] font-sans pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatDate(res.startAt)}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                      <span className="font-mono text-[var(--text-primary)]">
                        {formatInterval(res.startAt, res.endAt)}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="text-[var(--text-muted)]">
                      {formatDuration(res.startAt, res.endAt)}
                    </span>
                  </div>

                  {res.cancellationReason && (
                    <p className="text-xs text-[var(--terracotta-primary)] mt-1 font-mono">
                      Reason: {res.cancellationReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isConfirmed && isUpcoming && (
                    <Button variant="secondary" size="sm" onClick={() => setSelectedForCancel(res)}>
                      Cancel Reservation
                    </Button>
                  )}
                  {res.spaceId && (
                    <Link href={`/spaces/${res.spaceId}`}>
                      <Button variant="subtle" size="sm">
                        View Space
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && currentList.length === 0 && (
        <div className="py-16 text-center bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-8">
          <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
            {tab === "upcoming" ? "No upcoming reservations" : "No past reservations found"}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            {tab === "upcoming"
              ? "You do not have any workspaces currently scheduled."
              : "Your completed and cancelled reservation history will be recorded here."}
          </p>
          <div className="mt-6">
            <Link href="/spaces">
              <Button variant="primary" size="sm">
                Explore Spaces
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedForCancel && (
        <CancelReservationModal
          isOpen={!!selectedForCancel}
          onClose={() => setSelectedForCancel(null)}
          reservation={selectedForCancel}
        />
      )}
    </main>
  );
}
