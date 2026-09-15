"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceDto, ApiResponse, ReservationDto } from "@coworkflow/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatDate, formatInterval, formatDuration } from "@/lib/date-utils";
import { AlertTriangle, Clock, Calendar, CheckCircle2 } from "lucide-react";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceDto;
  startAt: string;
  endAt: string;
}

export function BookingModal({ isOpen, onClose, space, startAt, endAt }: BookingModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [purpose, setPurpose] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      setConflictError(null);
      return apiClient<ApiResponse<ReservationDto>>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          spaceId: space.id,
          startAt,
          endAt,
          purpose: purpose.trim() || undefined,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["availability", space.id] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });

      success("Reservation Confirmed", `${space.name} is booked for you.`);
      onClose();
      router.push("/reservations");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === "RESERVATION_CONFLICT") {
          setConflictError(
            "Booking Conflict: Another member confirmed an overlapping reservation just moments ago. Please choose another time interval."
          );
        } else {
          setConflictError(err.message || "Failed to create reservation.");
        }
      } else {
        toastError("Booking failed", "A network error occurred. Please try again.");
      }
    },
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Reservation"
      description="Review your booking details before confirming"
      maxWidth="md"
    >
      <div className="space-y-6 font-sans">
        {/* Conflict Alert Banner */}
        {conflictError && (
          <div
            role="alert"
            className="p-4 rounded-[6px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/40 text-[var(--terracotta-primary)] text-xs flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">PostgreSQL Concurrency Conflict</p>
              <p className="mt-0.5 leading-relaxed">{conflictError}</p>
            </div>
          </div>
        )}

        {/* Booking Details Architectural Summary */}
        <div className="rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-default)] p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Selected Workspace
              </span>
              <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                {space.name}
              </h4>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-[var(--surface-card)] border border-[var(--border-default)] text-[var(--gold-primary)] font-mono uppercase">
              {space.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block mb-0.5">Date</span>
              <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                {formatDate(startAt)}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block mb-0.5">Duration</span>
              <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                {formatDuration(startAt, endAt)}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-[var(--border-default)]">
              <span className="text-[var(--text-muted)] block mb-0.5">Reserved Interval</span>
              <span className="font-medium text-[var(--text-primary)] font-mono">
                {formatInterval(startAt, endAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Purpose Field */}
        <div>
          <Label htmlFor="booking-purpose">Reservation Purpose (Optional)</Label>
          <Input
            id="booking-purpose"
            placeholder="e.g. Design review with client, Sprint planning"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        {/* Invariant Security & Concurrency Guarantee */}
        <div className="p-3 rounded-[6px] bg-[var(--surface-muted)] text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--teal-primary)] shrink-0 mt-0.5" />
          <p>
            Confirmed intervals are locked atomically in PostgreSQL via GiST exclusion constraints.
            Zero double-booking guarantee enforced.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Confirm Reservation
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
