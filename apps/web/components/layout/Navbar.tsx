"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/spaces", label: "Spaces" },
    ...(isAuthenticated
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/reservations", label: "My Bookings" },
        ]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin Console" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-canvas)]/95 backdrop-blur-xs border-b border-[var(--border-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--gold-primary)] text-white flex items-center justify-center font-bold text-sm tracking-tighter group-hover:bg-[var(--gold-hover)] transition-colors shadow-xs">
              CW
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)]">
              CoWorkFlow
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-3 py-1.5 rounded-[6px] text-sm font-medium transition-colors font-sans",
                    isActive
                      ? "bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Auth State & Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] border border-[var(--border-default)] bg-[var(--surface-card)] hover:border-[var(--border-strong)] transition-colors text-xs font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--gold-soft)] text-[var(--gold-hover)] flex items-center justify-center font-bold text-[11px]">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <span className="text-[var(--text-primary)]">
                  {user.firstName} {user.lastName}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[var(--surface-dark)] text-white text-[10px] font-mono tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    ADMIN
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-[var(--text-muted)] hover:text-[var(--terracotta-primary)]"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Join CoWorkFlow
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[6px] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--border-default)]">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--gold-soft)] text-[var(--gold-hover)] flex items-center justify-center font-bold text-xs">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Join CoWorkFlow
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
