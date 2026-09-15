import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={twMerge(
          clsx(
            "w-full h-11 px-3.5 rounded-[6px] bg-[var(--surface-card)] text-[var(--text-primary)] text-sm font-sans placeholder:text-[var(--text-muted)] border transition-colors duration-100",
            "border-[var(--border-default)] hover:border-[var(--border-strong)]",
            "focus-visible:border-[var(--gold-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-primary)]",
            "disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed",
            hasError &&
              "border-[var(--terracotta-primary)] focus-visible:border-[var(--terracotta-primary)] focus-visible:ring-[var(--terracotta-primary)]",
            className
          )
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
