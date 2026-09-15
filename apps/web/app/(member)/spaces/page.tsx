"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SpaceDto, ApiResponse } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { SpaceFilters, FilterState } from "@/components/spaces/SpaceFilters";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Building2, SearchX } from "lucide-react";

export default function SpacesPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "",
    minCapacity: "",
    amenities: [],
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => apiClient<ApiResponse<SpaceDto[]>>("/spaces"),
  });

  const spaces = data?.data || [];

  // Extract unique amenities across all spaces
  const availableAmenities = useMemo(() => {
    const set = new Set<string>();
    spaces.forEach((s) => {
      s.amenities?.forEach((a) => set.add(a));
    });
    return Array.from(set).sort();
  }, [spaces]);

  // Filter spaces client-side
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = space.name.toLowerCase().includes(query);
        const matchesDesc = space.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      if (filters.type && space.type !== filters.type) {
        return false;
      }

      if (filters.minCapacity && space.capacity < Number(filters.minCapacity)) {
        return false;
      }

      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((a) => space.amenities?.includes(a));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [spaces, filters]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-[var(--gold-primary)]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            Catalog Overview
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Explore Workspaces
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)] font-sans max-w-2xl">
          Browse dedicated desks, acoustic focus pods, and boardrooms at our San Francisco Flagship.
          Select any space to view real-time availability and reserve.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8">
        <SpaceFilters
          filters={filters}
          onChange={setFilters}
          availableAmenities={availableAmenities}
        />
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>
          Showing{" "}
          <strong className="text-[var(--text-primary)] font-semibold">
            {filteredSpaces.length}
          </strong>{" "}
          of {spaces.length} spaces
        </span>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] space-y-4"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <div className="pt-4 border-t border-[var(--border-default)] flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-[8px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/30 text-center">
          <p className="font-semibold text-sm text-[var(--terracotta-primary)]">
            Failed to load workspaces
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Please ensure the CoWorkFlow API service is running.
          </p>
        </div>
      )}

      {/* Spaces Grid */}
      {!isLoading && !error && filteredSpaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredSpaces.length === 0 && (
        <div className="py-16 text-center bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-8">
          <SearchX className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
            No workspaces match your criteria
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, capacity limits, or selected amenities.
          </p>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ search: "", type: "", minCapacity: "", amenities: [] })}
            >
              Reset All Filters
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
