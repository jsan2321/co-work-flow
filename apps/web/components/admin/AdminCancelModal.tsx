"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReservationDto, ApiResponse } from "@coworkflow/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatInterval } from "@/lib/date-utils";
import { ShieldAlert } from "lucide-react";

export interface AdminCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
}

export function AdminCancelModal({ isOpen, onClose, reservation }: AdminCancelModalProps) {
  const queryClient = useQueryClient();
  const { success } = useToast();

  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!reservation) return;
      setErrorMsg(null);
      return apiClient<ApiResponse<ReservationDto>>(`/admin/reservations/${reservation.id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: reason.trim() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });

      success("Reservation Cancelled", "Audit log record has been created.");
      setReason("");
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Administrative cancellation failed.");
      } else {
        setErrorMsg("Network error. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("A formal cancellation reason is required for the audit trail.");
      return;
    }
    mutation.mutate();
  };

  if (!reservation) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Administrative Dispute Override"
      description="Cancel this booking regardless of owner or cutoff window."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {errorMsg && (
          <div className="p-3 rounded-[6px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/30 text-[var(--terracotta-primary)] text-xs">
            {errorMsg}
          </div>
        )}

        <div className="p-3.5 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1 text-xs">
          <p className="font-serif font-bold text-sm text-[var(--text-primary)]">
            {reservation.space?.name || "Workspace"}
          </p>
          <p className="text-[var(--text-secondary)]">
            Member: {reservation.user?.firstName} {reservation.user?.lastName} (
            {reservation.user?.email})
          </p>
          <p className="font-mono text-[var(--text-primary)]">
            {formatInterval(reservation.startAt, reservation.endAt)}
          </p>
        </div>

        <div className="p-3 rounded-[6px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/30 text-xs text-[var(--terracotta-primary)] flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            This action immediately releases the slot and permanently records your admin user ID,
            correlation ID, and reason into the immutable Audit Log.
          </p>
        </div>

        <div>
          <Label htmlFor="cancel-reason" requiredIndicator>
            Mandatory Cancellation Reason
          </Label>
          <Input
            id="cancel-reason"
            placeholder="e.g. Urgent HVAC maintenance, Double-booking dispute resolution"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Keep Reservation
          </Button>
          <Button type="submit" variant="destructive" size="md" isLoading={mutation.isPending}>
            Confirm Override
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
