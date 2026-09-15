"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReservationDto, ApiResponse } from "@coworkflow/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { isWithinMemberCancellationCutoff, formatDate, formatInterval } from "@/lib/date-utils";
import { AlertTriangle, Info } from "lucide-react";

export interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
}

export function CancelReservationModal({
  isOpen,
  onClose,
  reservation,
}: CancelReservationModalProps) {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const isEligible = reservation ? isWithinMemberCancellationCutoff(reservation.startAt) : false;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!reservation) return;
      return apiClient<ApiResponse<ReservationDto>>(`/reservations/${reservation.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      success("Reservation Cancelled", "The slot has been released.");
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 403 || err.code === "CANCELLATION_WINDOW_CLOSED") {
          toastError(
            "Cancellation Window Closed",
            "Self-service cancellations are not permitted within 1 hour of reservation start."
          );
        } else {
          toastError("Cancellation Failed", err.message || "An error occurred.");
        }
      } else {
        toastError("Error", "Network error. Please try again.");
      }
    },
  });

  if (!reservation) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEligible ? "Cancel Reservation" : "Cancellation Window Closed"}
      maxWidth="sm"
    >
      <div className="space-y-4 font-sans">
        {/* Reservation summary card */}
        <div className="p-4 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1 text-xs">
          <p className="font-serif font-bold text-sm text-[var(--text-primary)]">
            {reservation.space?.name || "Workspace"}
          </p>
          <p className="text-[var(--text-secondary)]">{formatDate(reservation.startAt)}</p>
          <p className="font-mono text-[var(--text-primary)]">
            {formatInterval(reservation.startAt, reservation.endAt)}
          </p>
        </div>

        {isEligible ? (
          <>
            <div className="p-3.5 rounded-[6px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/30 text-xs text-[var(--terracotta-primary)] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Release this booking?</p>
                <p className="mt-0.5 leading-relaxed">
                  Cancelling will immediately return this time slot to the available pool for all
                  members.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end gap-3">
              <Button variant="ghost" size="md" onClick={onClose} disabled={mutation.isPending}>
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                size="md"
                isLoading={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                Confirm Cancellation
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3.5 rounded-[6px] bg-[var(--surface-muted)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[var(--gold-primary)] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">1-Hour Cutoff Enforced</p>
                <p className="mt-1 leading-relaxed">
                  Per system policy (BR-RES-006), reservations starting in under 1 hour can only be
                  cancelled by an administrator. Please reach out to the front desk for assistance.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end">
              <Button variant="secondary" size="md" onClick={onClose}>
                Understood
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
