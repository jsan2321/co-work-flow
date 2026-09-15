import React from "react";
import Link from "next/link";
import { LOCATION_TIMEZONE_LABEL } from "@/lib/date-utils";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-default)] bg-[var(--bg-canvas)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-[4px] bg-[var(--gold-primary)] text-white flex items-center justify-center font-bold text-xs">
                CW
              </div>
              <span className="font-serif font-bold text-base text-[var(--text-primary)]">
                CoWorkFlow
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Precision Workspace Reservations. Guaranteed zero double-bookings engineered via
              PostgreSQL GiST exclusion constraints on half-open interval ranges.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--teal-primary)] inline-block" />
              <span>San Francisco Flagship ({LOCATION_TIMEZONE_LABEL})</span>
            </div>
            <div className="flex gap-4">
              <Link href="/spaces" className="hover:text-[var(--text-primary)] transition-colors">
                Spaces
              </Link>
              <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-[var(--text-primary)] transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--text-muted)] gap-4">
          <p>© 2026 CoWorkFlow. Architectural Editorial SaaS Design Language.</p>
          <div className="flex items-center gap-4">
            <span>Source Serif 4 & Space Grotesk</span>
            <span>•</span>
            <span>WCAG 2.2 AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
