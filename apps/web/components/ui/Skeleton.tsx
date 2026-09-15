import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(clsx("animate-pulse rounded-[4px] bg-[var(--surface-muted)]", className))}
      {...props}
    />
  );
}
