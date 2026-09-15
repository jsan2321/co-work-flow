"use client";

import React from "react";
import type { SpaceType } from "@coworkflow/types";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { clsx } from "clsx";

export interface FilterState {
  search: string;
  type?: SpaceType | "";
  minCapacity?: number | "";
  amenities: string[];
}

export interface SpaceFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableAmenities: string[];
}

export function SpaceFilters({ filters, onChange, availableAmenities }: SpaceFiltersProps) {
  const typeOptions: Array<{ label: string; value: SpaceType | "" }> = [
    { label: "All Spaces", value: "" },
    { label: "Desks", value: "DESK" },
    { label: "Meeting Rooms", value: "MEETING_ROOM" },
    { label: "Private Offices", value: "PRIVATE_OFFICE" },
  ];

  const capacityOptions: Array<{ label: string; value: number | "" }> = [
    { label: "Any Size", value: "" },
    { label: "1+ person", value: 1 },
    { label: "2+ people", value: 2 },
    { label: "4+ people", value: 4 },
    { label: "8+ people", value: 8 },
  ];

  const toggleAmenity = (amenity: string) => {
    const nextAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: nextAmenities });
  };

  const clearFilters = () => {
    onChange({
      search: "",
      type: "",
      minCapacity: "",
      amenities: [],
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.type) ||
    Boolean(filters.minCapacity) ||
    filters.amenities.length > 0;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-5 shadow-xs space-y-4">
      {/* Top search & type bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <Input
            placeholder="Search by space name or keywords..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9.5"
          />
        </div>

        {/* Space Type Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {typeOptions.map((opt) => {
            const isSelected = filters.type === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ ...filters, type: opt.value })}
                className={clsx(
                  "px-3 py-2 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-colors border select-none cursor-pointer",
                  isSelected
                    ? "bg-[var(--surface-dark)] text-white border-[var(--surface-dark)]"
                    : "bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Row: Capacity & Amenities */}
      <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Capacity Selector */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
            Capacity:
          </span>
          <div className="flex items-center gap-1">
            {capacityOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ ...filters, minCapacity: opt.value })}
                className={clsx(
                  "px-2.5 py-1 rounded-[4px] border font-medium transition-colors cursor-pointer",
                  filters.minCapacity === opt.value
                    ? "bg-[var(--gold-soft)] text-[var(--gold-hover)] border-[var(--gold-primary)]/40 font-semibold"
                    : "bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-[var(--terracotta-primary)] hover:text-[var(--terracotta-hover)] font-medium cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Amenity Checklist */}
      {availableAmenities.length > 0 && (
        <div className="pt-3 border-t border-[var(--border-default)]">
          <span className="block font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[11px] mb-2">
            Amenities:
          </span>
          <div className="flex flex-wrap gap-2">
            {availableAmenities.map((amenity) => {
              const isChecked = filters.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={clsx(
                    "px-2.5 py-1 rounded-[4px] border text-xs transition-colors cursor-pointer flex items-center gap-1.5",
                    isChecked
                      ? "bg-[var(--teal-soft)] text-[var(--teal-primary)] border-[var(--teal-primary)]/40 font-medium"
                      : "bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      isChecked ? "bg-[var(--teal-primary)]" : "bg-[var(--text-muted)]"
                    )}
                  />
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
