"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { type: ToastType; title: string; message?: string }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message }: { type: ToastType; title: string; message?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );
  const error = useCallback(
    (title: string, message?: string) => addToast({ type: "error", title, message }),
    [addToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: "warning", title, message }),
    [addToast]
  );
  const info = useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
      >
        {toasts.map((item) => {
          const config = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-[var(--green-primary)] shrink-0" />,
              border: "border-[var(--green-primary)]/40",
              bg: "bg-[var(--surface-card)]",
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-[var(--terracotta-primary)] shrink-0" />,
              border: "border-[var(--terracotta-primary)]/40",
              bg: "bg-[var(--surface-card)]",
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-[var(--gold-primary)] shrink-0" />,
              border: "border-[var(--gold-primary)]/40",
              bg: "bg-[var(--surface-card)]",
            },
            info: {
              icon: <Info className="w-5 h-5 text-[var(--teal-primary)] shrink-0" />,
              border: "border-[var(--teal-primary)]/40",
              bg: "bg-[var(--surface-card)]",
            },
          }[item.type];

          return (
            <div
              key={item.id}
              className={clsx(
                "pointer-events-auto p-4 rounded-[8px] border shadow-[0_4px_16px_rgba(32,37,34,0.08)] flex items-start gap-3 transition-all duration-150 animate-in slide-in-from-bottom-2",
                config.bg,
                config.border
              )}
            >
              {config.icon}
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-sm text-[var(--text-primary)]">
                  {item.title}
                </p>
                {item.message && (
                  <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
