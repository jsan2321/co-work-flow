"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--gold-primary)] animate-pulse mx-auto" />
          <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
            Authenticating operational access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full p-8 rounded-[12px] bg-[var(--surface-card)] border border-[var(--border-strong)] text-center shadow-xs">
          <div className="w-12 h-12 rounded-[6px] bg-[var(--terracotta-soft)] text-[var(--terracotta-primary)] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            Restricted Administrative Access
          </h2>
          <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
            This section requires verified Administrator privileges. Your active session is
            authenticated as {user ? `"${user.role}"` : "Anonymous"}.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Return to Member Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[var(--bg-canvas)]">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
    </div>
  );
}
