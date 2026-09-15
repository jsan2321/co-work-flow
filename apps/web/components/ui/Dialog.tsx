"use client";

import React, { useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: DialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#202522]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={twMerge(
          clsx(
            "relative w-full bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[12px] shadow-[0_8px_32px_rgba(32,37,34,0.12)] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150",
            maxWidthStyles[maxWidth]
          )
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--border-default)] bg-[var(--surface-subtle)]">
          <div>
            <h2
              id="dialog-title"
              className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--text-secondary)] font-sans">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
