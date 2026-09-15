"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { SpaceDto, ApiResponse } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Users, MapPin, Sparkles } from "lucide-react";

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params?.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => apiClient<ApiResponse<SpaceDto>>(`/spaces/${spaceId}`),
    enabled: !!spaceId,
  });

  const space = data?.data;

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-96 w-full" />
      </main>
    );
  }

  if (error || !space) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
          Workspace Not Found
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">
          The requested space does not exist or may have been removed.
        </p>
        <Link
          href="/spaces"
          className="text-xs font-semibold text-[var(--gold-primary)] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Spaces catalog</span>
        </Link>
      </main>
    );
  }

  const typeDisplay =
    {
      DESK: "Dedicated Workstation",
      MEETING_ROOM: "Meeting & Conference Suite",
      PRIVATE_OFFICE: "Private Executive Office",
    }[space.type] || space.type;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all workspaces</span>
        </Link>
      </div>

      {/* Space Overview Header */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[var(--border-default)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest font-semibold text-[var(--gold-primary)]">
                {typeDisplay}
              </span>
              <span>•</span>
              <ReservationPill
                status={space.status === "ACTIVE" ? "available" : "inactive"}
                size="sm"
              />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              {space.name}
            </h1>

            {space.description && (
              <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed font-sans">
                {space.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)] bg-[var(--surface-subtle)] px-4 py-3 rounded-[6px] border border-[var(--border-default)] shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--teal-primary)]" />
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">
                  Capacity
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {space.capacity} {space.capacity === 1 ? "Person" : "People"}
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-[var(--border-default)]" />

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--teal-primary)]" />
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">
                  Location
                </span>
                <span className="font-semibold text-[var(--text-primary)]">SF Flagship</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="pt-6">
            <h3 className="text-xs font-mono uppercase tracking-widest font-semibold text-[var(--text-muted)] mb-3">
              Included Amenities & Equipment
            </h3>
            <div className="flex flex-wrap gap-2">
              {space.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="px-3 py-1.5 rounded-[6px] bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[var(--gold-primary)]" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Availability Section */}
      <section>
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Schedule & Real-Time Availability
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Select a date and choose available time intervals to create an atomic booking.
          </p>
        </div>

        <AvailabilityCalendar space={space} />
      </section>
    </main>
  );
}
