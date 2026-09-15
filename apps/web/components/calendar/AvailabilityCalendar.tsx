"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { SpaceDto, ApiResponse, SpaceAvailabilityResponse } from "@coworkflow/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { BookingModal } from "@/components/calendar/BookingModal";
import {
  generateDaySlots,
  getUpcomingDays,
  formatDate,
  formatTime,
  formatDuration,
  LOCATION_TIMEZONE,
  LOCATION_TIMEZONE_LABEL,
  TimeSlot,
} from "@/lib/date-utils";
import { Calendar as CalendarIcon, Clock, AlertCircle, ChevronRight, LogIn } from "lucide-react";
import { clsx } from "clsx";

export interface AvailabilityCalendarProps {
  space: SpaceDto;
}

export function AvailabilityCalendar({ space }: AvailabilityCalendarProps) {
  const { isAuthenticated } = useAuth();
  const upcomingDays = useMemo(() => getUpcomingDays(14), []);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const selectedDate = upcomingDays[selectedDayIndex] || upcomingDays[0];

  // Fetch confirmed reservations for this space within the selected day's window
  const queryStartDate = new Date(selectedDate);
  queryStartDate.setUTCHours(0, 0, 0, 0);
  const queryEndDate = new Date(selectedDate);
  queryEndDate.setUTCHours(23, 59, 59, 999);

  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ["availability", space.id, queryStartDate.toISOString()],
    queryFn: () =>
      apiClient<ApiResponse<SpaceAvailabilityResponse>>(`/spaces/${space.id}/availability`, {
        params: {
          startDate: queryStartDate.toISOString(),
          endDate: queryEndDate.toISOString(),
        },
      }),
  });

  const confirmedIntervals = availabilityData?.data?.intervals || [];

  // Generate 30-minute day slots
  const daySlots = useMemo(() => generateDaySlots(selectedDate), [selectedDate]);

  // Track user selection: start slot ID and end slot ID
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Helper to check if an individual slot is in the past
  const now = Date.now();
  const isSlotInPast = (slot: TimeSlot) => {
    return new Date(slot.startAt).getTime() < now;
  };

  // Helper to check if a slot overlaps with any confirmed reservation interval
  const isSlotReserved = (slot: TimeSlot) => {
    const slotStart = new Date(slot.startAt).getTime();
    const slotEnd = new Date(slot.endAt).getTime();

    return confirmedIntervals.some((interval) => {
      const intStart = new Date(interval.startAt).getTime();
      const intEnd = new Date(interval.endAt).getTime();
      // Overlap of two half-open intervals [s1, e1) and [s2, e2) is: s1 < e2 && s2 < e1
      return slotStart < intEnd && intStart < slotEnd;
    });
  };

  // Determine slot indices
  const startIndex = daySlots.findIndex((s) => s.id === startSlotId);
  const endIndex = daySlots.findIndex((s) => s.id === endSlotId);

  // Handle slot click
  const handleSlotClick = (slot: TimeSlot) => {
    if (isSlotInPast(slot) || isSlotReserved(slot)) {
      return;
    }

    const clickedIndex = daySlots.findIndex((s) => s.id === slot.id);

    if (startSlotId === null) {
      // First click: select start time
      setStartSlotId(slot.id);
      setEndSlotId(slot.id); // default 30-min duration
    } else if (endSlotId !== null && startSlotId !== endSlotId) {
      // Selection already completed: reset to new start time
      setStartSlotId(slot.id);
      setEndSlotId(slot.id);
    } else {
      // Second click: select end time or reset
      if (clickedIndex < startIndex) {
        setStartSlotId(slot.id);
        setEndSlotId(slot.id);
      } else {
        // Enforce maximum 8-hour duration (16 30-min slots)
        if (clickedIndex - startIndex + 1 > 16) {
          return;
        }
        setEndSlotId(slot.id);
      }
    }
  };

  // Check if selected range contains any reserved slots (conflict detection)
  const hasRangeConflict = useMemo(() => {
    if (startIndex === -1 || endIndex === -1) return false;
    for (let i = startIndex; i <= endIndex; i++) {
      if (isSlotReserved(daySlots[i])) {
        return true;
      }
    }
    return false;
  }, [startIndex, endIndex, daySlots, confirmedIntervals]);

  // Selected interval timestamps
  const selectedStartAt = startIndex !== -1 ? daySlots[startIndex].startAt : null;
  const selectedEndAt = endIndex !== -1 ? daySlots[endIndex].endAt : null;

  const resetSelection = () => {
    setStartSlotId(null);
    setEndSlotId(null);
  };

  return (
    <div className="space-y-6">
      {/* 14-Day Architectural Date Ribbon */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[var(--gold-primary)]" />
            <span className="font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Select Date
            </span>
          </div>
          <span className="text-[var(--text-muted)] font-mono">
            {LOCATION_TIMEZONE} ({LOCATION_TIMEZONE_LABEL})
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {upcomingDays.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            const weekday = new Intl.DateTimeFormat("en-US", {
              timeZone: LOCATION_TIMEZONE,
              weekday: "short",
            }).format(day);
            const dayNum = new Intl.DateTimeFormat("en-US", {
              timeZone: LOCATION_TIMEZONE,
              day: "numeric",
            }).format(day);
            const month = new Intl.DateTimeFormat("en-US", {
              timeZone: LOCATION_TIMEZONE,
              month: "short",
            }).format(day);

            const isToday = idx === 0;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setSelectedDayIndex(idx);
                  resetSelection();
                }}
                className={clsx(
                  "flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-[6px] border text-center transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-[var(--surface-dark)] text-white border-[var(--surface-dark)] shadow-xs"
                    : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                  {isToday ? "Today" : weekday}
                </span>
                <span className="text-base font-bold font-serif my-0.5">{dayNum}</span>
                <span className="text-[10px] opacity-75">{month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Matrix Header & Legend */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-default)] gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
              {formatDate(selectedDate.toISOString())}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Click a start slot and an end slot to reserve. Durations between 30 mins and 8 hours.
            </p>
          </div>

          {/* Color & Multi-modal Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[var(--teal-soft)] border border-[var(--teal-primary)]/40" />
              <span className="text-[var(--text-secondary)]">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[var(--gold-primary)]" />
              <span className="text-[var(--text-secondary)]">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[var(--surface-muted)] border border-[var(--border-strong)]" />
              <span className="text-[var(--text-muted)]">Reserved</span>
            </div>
          </div>
        </div>

        {/* 30-Minute Time Slot Matrix */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-[6px] bg-[var(--surface-muted)] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {daySlots.map((slot, index) => {
                const isPast = isSlotInPast(slot);
                const isReserved = isSlotReserved(slot);

                const isSelected =
                  startIndex !== -1 && endIndex !== -1 && index >= startIndex && index <= endIndex;

                const isConflict = isSelected && isReserved;

                let stateStyle =
                  "bg-[var(--teal-soft)] text-[var(--teal-primary)] border-[var(--teal-primary)]/30 hover:border-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/15 cursor-pointer";
                let badgeText = "Available";

                if (isPast) {
                  stateStyle =
                    "bg-[var(--surface-muted)] text-[var(--text-muted)] opacity-50 border-[var(--border-default)] cursor-not-allowed";
                  badgeText = "Past";
                } else if (isConflict) {
                  stateStyle =
                    "bg-[var(--terracotta-soft)] text-[var(--terracotta-primary)] border-[var(--terracotta-primary)]/60 cursor-pointer";
                  badgeText = "Conflict";
                } else if (isSelected) {
                  stateStyle =
                    "bg-[var(--gold-primary)] text-white border-[var(--gold-primary)] shadow-xs cursor-pointer";
                  badgeText = "Selected";
                } else if (isReserved) {
                  stateStyle =
                    "bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border-default)] cursor-not-allowed";
                  badgeText = "Occupied";
                }

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isPast || (!isSelected && isReserved)}
                    onClick={() => handleSlotClick(slot)}
                    className={clsx(
                      "p-3 rounded-[6px] border text-left flex flex-col justify-between h-16 transition-all font-sans select-none",
                      stateStyle
                    )}
                  >
                    <span className="font-mono text-xs font-semibold">{slot.displayStart}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
                      {badgeText}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating / Docked Selection Summary */}
        {selectedStartAt && selectedEndAt && (
          <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-subtle)] p-5 rounded-[8px] border">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--gold-primary)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Your Selection
                </span>
                {hasRangeConflict && (
                  <span className="text-xs font-semibold text-[var(--terracotta-primary)] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Conflict Detected
                  </span>
                )}
              </div>
              <p className="font-serif text-lg font-bold text-[var(--text-primary)] mt-1">
                {formatTime(selectedStartAt)} – {formatTime(selectedEndAt)} (
                {formatDuration(selectedStartAt, selectedEndAt)})
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {formatDate(selectedStartAt)} • {LOCATION_TIMEZONE_LABEL}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                Reset
              </Button>

              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={hasRangeConflict}
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  <span>Book This Space</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="md">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    <span>Sign in to Reserve</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Confirmation Dialog */}
      {selectedStartAt && selectedEndAt && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          space={space}
          startAt={selectedStartAt}
          endAt={selectedEndAt}
        />
      )}
    </div>
  );
}
