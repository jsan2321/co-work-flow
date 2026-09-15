import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type PillStatus =
  | "available"
  | "selected"
  | "reserved"
  | "conflict"
  | "confirmed"
  | "cancelled"
  | "active"
  | "inactive";

export interface ReservationPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: PillStatus;
  label?: string;
  size?: "sm" | "md";
}

export function ReservationPill({
  status,
  label,
  size = "md",
  className,
  ...props
}: ReservationPillProps) {
  const statusConfig = {
    available: {
      bg: "bg-[var(--teal-soft)]",
      text: "text-[var(--teal-primary)]",
      border: "border-[var(--teal-primary)]/25",
      dot: "bg-[var(--teal-primary)]",
      defaultLabel: "Available",
    },
    selected: {
      bg: "bg-[var(--gold-soft)]",
      text: "text-[var(--gold-hover)]",
      border: "border-[var(--gold-primary)]/30",
      dot: "bg-[var(--gold-primary)]",
      defaultLabel: "Selected",
    },
    reserved: {
      bg: "bg-[var(--surface-muted)]",
      text: "text-[var(--text-primary)]",
      border: "border-[var(--border-strong)]",
      dot: "bg-[var(--surface-dark)]",
      defaultLabel: "Reserved",
    },
    conflict: {
      bg: "bg-[var(--terracotta-soft)]",
      text: "text-[var(--terracotta-primary)]",
      border: "border-[var(--terracotta-primary)]/30",
      dot: "bg-[var(--terracotta-primary)]",
      defaultLabel: "Conflict",
    },
    confirmed: {
      bg: "bg-[var(--green-soft)]",
      text: "text-[var(--green-primary)]",
      border: "border-[var(--green-primary)]/30",
      dot: "bg-[var(--green-primary)]",
      defaultLabel: "Confirmed",
    },
    cancelled: {
      bg: "bg-[var(--surface-muted)]",
      text: "text-[var(--text-muted)]",
      border: "border-[var(--border-default)]",
      dot: "bg-[var(--text-muted)]",
      defaultLabel: "Cancelled",
    },
    active: {
      bg: "bg-[var(--green-soft)]",
      text: "text-[var(--green-primary)]",
      border: "border-[var(--green-primary)]/30",
      dot: "bg-[var(--green-primary)]",
      defaultLabel: "Active",
    },
    inactive: {
      bg: "bg-[var(--surface-muted)]",
      text: "text-[var(--text-muted)]",
      border: "border-[var(--border-default)]",
      dot: "bg-[var(--text-muted)]",
      defaultLabel: "Inactive",
    },
  };

  const current = statusConfig[status];
  const displayLabel = label || current.defaultLabel;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-[12px] gap-2",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full font-sans font-semibold tracking-wider uppercase border select-none transition-colors",
          sizeStyles[size],
          current.bg,
          current.text,
          current.border,
          className
        )
      )}
      {...props}
    >
      <span
        className={clsx(
          "rounded-full shrink-0",
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
          current.dot
        )}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
}
