"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  FileText,
  Users,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import { clsx } from "clsx";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/spaces", label: "Spaces", icon: Building2 },
    { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
    { href: "/admin/audit-logs", label: "Audit Ledger", icon: FileText },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[var(--surface-card)] border-r border-[var(--border-default)] min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div>
        <div className="px-3 py-2 mb-4 flex items-center gap-2 border-b border-[var(--border-default)] pb-4">
          <div className="w-7 h-7 rounded-[4px] bg-[var(--surface-dark)] text-white flex items-center justify-center font-mono text-xs">
            <ShieldAlert className="w-4 h-4 text-[var(--gold-primary)]" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-[var(--text-primary)]">
              Operational Suite
            </h2>
            <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Admin Console
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-colors font-sans",
                  isActive
                    ? "bg-[var(--surface-dark)] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
                )}
              >
                <Icon
                  className={clsx(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-[var(--gold-primary)]" : "text-[var(--text-muted)]"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[var(--border-default)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Member Portal</span>
        </Link>
      </div>
    </aside>
  );
}
