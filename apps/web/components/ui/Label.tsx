import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredIndicator?: boolean;
}

export function Label({ className, requiredIndicator = false, children, ...props }: LabelProps) {
  return (
    <label
      className={twMerge(
        clsx(
          "block text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)] mb-1.5 font-sans",
          className
        )
      )}
      {...props}
    >
      {children}
      {requiredIndicator && (
        <span className="text-[var(--terracotta-primary)] ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
