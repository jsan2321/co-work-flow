import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { ShieldCheck, CalendarCheck, Users, Layers, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-muted)] text-[var(--gold-hover)] border border-[var(--gold-primary)]/25 text-xs font-mono font-semibold tracking-wider uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-primary)]" />
                High-Concurrency Reservation Engine
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.08] mb-6">
                CoWorkFlow — Precision Workspace Reservations. Guaranteed Zero Double-Bookings.
              </h1>

              <p className="font-sans text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
                Engineered with database-level PostgreSQL GiST exclusion constraints over half-open
                temporal intervals. Architectural clarity, calm productivity, and total operational
                certainty for modern spaces.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/spaces">
                  <Button variant="primary" size="lg">
                    <span>Explore Spaces</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg">
                    Create Member Account
                  </Button>
                </Link>
              </div>

              {/* Invariant proof badges */}
              <div className="mt-10 pt-6 border-t border-[var(--border-default)] grid grid-cols-3 gap-4">
                <div>
                  <p className="font-serif text-2xl font-bold text-[var(--text-primary)]">0%</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Double-booking tolerance
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-[var(--text-primary)]">15m</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Rotating session hygiene
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-[var(--text-primary)]">100%</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    GiST concurrency gate
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Signature Blueprint / Availability Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-[12px] bg-[var(--surface-card)] border border-[var(--border-strong)] p-6 shadow-[0_8px_30px_rgba(32,37,34,0.08)]">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                      Live Architectural Engine
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                      Focus Studio A
                    </h3>
                  </div>
                  <ReservationPill status="available" />
                </div>

                <div className="py-5 space-y-4">
                  <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
                    <span>San Francisco Flagship</span>
                    <span className="font-mono">America/Los_Angeles</span>
                  </div>

                  {/* Simulated 30-min availability slot matrix */}
                  <div className="space-y-1.5 font-sans">
                    <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Schedule Snapshot (Today)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-[6px] bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border-default)] flex items-center justify-between">
                        <span className="font-mono">09:00 - 10:30</span>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">
                          Reserved
                        </span>
                      </div>
                      <div className="p-2.5 rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal-primary)] border border-[var(--teal-primary)]/30 flex items-center justify-between font-medium">
                        <span className="font-mono">10:30 - 12:00</span>
                        <span className="text-[10px] font-semibold uppercase">Available</span>
                      </div>
                      <div className="p-2.5 rounded-[6px] bg-[var(--gold-soft)] text-[var(--gold-hover)] border border-[var(--gold-primary)]/40 flex items-center justify-between font-semibold">
                        <span className="font-mono">13:00 - 15:00</span>
                        <span className="text-[10px] font-semibold uppercase">Selected</span>
                      </div>
                      <div className="p-2.5 rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal-primary)] border border-[var(--teal-primary)]/30 flex items-center justify-between font-medium">
                        <span className="font-mono">15:00 - 18:00</span>
                        <span className="text-[10px] font-semibold uppercase">Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)]">
                    <p className="font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                      PostgreSQL Engine Lock
                    </p>
                    Postgres GiST exclusion index serialized commit prevents simultaneous
                    overlapping intervals.
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[var(--text-muted)]">Capacity:</span>{" "}
                    <span className="font-semibold text-[var(--text-primary)]">4 people</span>
                  </div>
                  <Link href="/spaces">
                    <Button variant="primary" size="sm">
                      Check Availability
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Guarantees Grid */}
      <section className="py-16 md:py-24 bg-[var(--bg-canvas)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
              Engineering Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mt-2 mb-4">
              Engineered for Correctness Under Concurrency
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
              Unlike consumer booking tools that crumble under ticket-drop style concurrent
              requests, CoWorkFlow is built on mathematical interval theory and strict domain
              boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverable>
              <CardHeader>
                <div className="w-10 h-10 rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal-primary)] flex items-center justify-center mb-3">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <CardTitle>PostgreSQL GiST Exclusions</CardTitle>
                <CardDescription>
                  Database-level serialization eliminates application race conditions. Half-open
                  intervals{" "}
                  <code className="text-xs bg-[var(--surface-muted)] px-1 py-0.5 rounded">
                    [start, end)
                  </code>{" "}
                  guarantee seamless back-to-back reservations without double bookings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-[var(--text-secondary)] space-y-2 font-sans">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                    <span>SQLSTATE 23P01 exclusion mapped to HTTP 409</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
                    <span>100% pass rate under automated CI concurrency tests</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="w-10 h-10 rounded-[6px] bg-[var(--gold-soft)] text-[var(--gold-hover)] flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <CardTitle>Modular Monolith Architecture</CardTitle>
                <CardDescription>
                  Express 5 modular monolith with strict domain module isolation. Zero cross-module
                  repository imports; communication occurs exclusively via typed service interfaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-[var(--text-secondary)] space-y-2 font-sans">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                    <span>Isolated auth, spaces, reservations, and audit modules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                    <span>Prisma typed queries and correlation tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="w-10 h-10 rounded-[6px] bg-[var(--surface-muted)] text-[var(--text-primary)] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle>Zero LocalStorage Tokens</CardTitle>
                <CardDescription>
                  Access tokens reside exclusively in JavaScript memory. Refresh tokens are
                  rotating, HttpOnly, Secure cookies with automated token-family breach detection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-[var(--text-secondary)] space-y-2 font-sans">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                    <span>Argon2id password hashing (19 MiB, 2 iterations)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                    <span>Automatic silent refresh on app initialization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Spaces Teaser */}
      <section className="py-16 md:py-20 border-t border-[var(--border-default)] bg-[var(--surface-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--teal-primary)] font-semibold">
                San Francisco Flagship
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
                Curated Spaces for High-Focus Work
              </h2>
            </div>
            <Link href="/spaces" className="mt-4 md:mt-0">
              <Button variant="secondary" size="md">
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-default)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gold-primary)] font-sans">
                    Private Office
                  </span>
                  <ReservationPill status="available" size="sm" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Executive Suite 401
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Private acoustic office with ergonomic sit-stand desk and natural light.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Up to 2 people</span>
                  <span>•</span>
                  <span>4K Display</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-default)]">
                <Link href="/spaces">
                  <Button variant="primary" size="sm" className="w-full">
                    Book Suite
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-default)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--teal-primary)] font-sans">
                    Meeting Room
                  </span>
                  <ReservationPill status="available" size="sm" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Boardroom Meridian
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Conference room equipped for high-definition hybrid meetings and presentations.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Up to 10 people</span>
                  <span>•</span>
                  <span>Video Conferencing</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-default)]">
                <Link href="/spaces">
                  <Button variant="primary" size="sm" className="w-full">
                    Book Room
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-default)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-sans">
                    Dedicated Desk
                  </span>
                  <ReservationPill status="available" size="sm" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Quiet Focus Pod 12
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Individual dedicated workstation in the quiet library zone with monitor arm.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Users className="w-3.5 h-3.5" />
                  <span>1 person</span>
                  <span>•</span>
                  <span>Standing Desk</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-default)]">
                <Link href="/spaces">
                  <Button variant="primary" size="sm" className="w-full">
                    Book Desk
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
