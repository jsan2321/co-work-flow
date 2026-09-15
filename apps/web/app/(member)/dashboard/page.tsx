"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReservationDto, ApiResponse } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { CancelReservationModal } from "@/components/reservations/CancelReservationModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatInterval } from "@/lib/date-utils";
import { Calendar, Clock, Building2, ArrowRight, Sparkles, MapPin } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [cancellingReservation, setCancellingReservation] = useState<ReservationDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => apiClient<ApiResponse<ReservationDto[]>>("/reservations"),
  });

  const reservations = data?.data || [];
  const now = Date.now();

  // Partition reservations
  const upcomingReservations = reservations
    .filter((r) => r.status === "CONFIRMED" && new Date(r.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const nextBooking = upcomingReservations[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
              Member Workspace
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome, {user?.firstName || "Member"}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)] font-sans">
            Manage your scheduled workspaces and book new sessions at the San Francisco Flagship.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/spaces">
            <Button variant="primary" size="md">
              <span>Book a Space</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Spotlight: Next Upcoming Reservation */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Next Upcoming Reservation
          </h2>
          {upcomingReservations.length > 1 && (
            <Link
              href="/reservations"
              className="text-xs font-semibold text-[var(--gold-primary)] hover:underline"
            >
              View all {upcomingReservations.length} bookings →
            </Link>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-[8px]" />
        ) : nextBooking ? (
          <div className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-strong)] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[var(--border-default)]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest font-semibold text-[var(--gold-primary)]">
                    {nextBooking.space?.type}
                  </span>
                  <span>•</span>
                  <ReservationPill status="confirmed" size="sm" />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {nextBooking.space?.name || "Workspace"}
                </h3>

                {nextBooking.purpose && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)] font-sans italic">
                    &ldquo;{nextBooking.purpose}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 bg-[var(--surface-subtle)] p-4 rounded-[6px] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] font-sans">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--teal-primary)]" />
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono block">
                      Date
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatDate(nextBooking.startAt)}
                    </span>
                  </div>
                </div>

                <div className="w-px h-8 bg-[var(--border-default)] hidden sm:block" />

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--teal-primary)]" />
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono block">
                      Interval
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] font-mono">
                      {formatInterval(nextBooking.startAt, nextBooking.endAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <MapPin className="w-3.5 h-3.5" />
                <span>San Francisco Flagship • Floor 2</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancellingReservation(nextBooking)}
                >
                  Cancel Booking
                </Button>
                {nextBooking.spaceId && (
                  <Link href={`/spaces/${nextBooking.spaceId}`}>
                    <Button variant="secondary" size="sm">
                      View Space Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] p-8 text-center">
            <Building2 className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              No active reservations
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              You do not have any upcoming bookings scheduled. Explore available desks and meeting
              suites.
            </p>
            <div className="mt-4">
              <Link href="/spaces">
                <Button variant="primary" size="sm">
                  Find an Available Space
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable>
          <CardHeader>
            <div className="w-9 h-9 rounded-[6px] bg-[var(--gold-soft)] text-[var(--gold-hover)] flex items-center justify-center mb-2">
              <Building2 className="w-4 h-4" />
            </div>
            <CardTitle>Meeting Suites</CardTitle>
            <CardDescription>
              Acoustic conference rooms equipped with 4K screens and video conferencing for teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/spaces">
              <Button variant="subtle" size="sm" className="w-full">
                View Meeting Rooms
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardHeader>
            <div className="w-9 h-9 rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal-primary)] flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <CardTitle>Dedicated Desks</CardTitle>
            <CardDescription>
              Quiet workstations with ergonomic chairs, sit-stand desks, and monitor arms.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/spaces">
              <Button variant="subtle" size="sm" className="w-full">
                View Desks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardHeader>
            <div className="w-9 h-9 rounded-[6px] bg-[var(--surface-muted)] text-[var(--text-primary)] flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <CardTitle>My Booking History</CardTitle>
            <CardDescription>
              Review past reservations, check cancellation records, and view upcoming itineraries.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/reservations">
              <Button variant="subtle" size="sm" className="w-full">
                Open Reservations Ledger
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Cancel modal */}
      {cancellingReservation && (
        <CancelReservationModal
          isOpen={!!cancellingReservation}
          onClose={() => setCancellingReservation(null)}
          reservation={cancellingReservation}
        />
      )}
    </main>
  );
}
