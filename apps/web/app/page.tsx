export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--gold-primary)] flex items-center justify-center text-white font-bold text-sm">
            CW
          </div>
          <span className="font-display font-semibold tracking-tight text-xl text-[var(--text-primary)]">
            CoWorkFlow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--surface-muted)] text-[var(--text-secondary)] text-xs font-mono border border-[var(--border-default)]">
            <span className="w-2 h-2 rounded-full bg-[var(--teal-primary)] inline-block"></span>
            System Online
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 max-w-3xl">
        <p className="text-xs uppercase tracking-widest font-mono text-[var(--gold-primary)] font-semibold mb-4">
          High-Concurrency Reservation Engine
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6">
          Precision Workspace Reservations. Guaranteed Zero Double-Bookings.
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-10">
          Engineered with a PostgreSQL GiST exclusion constraint on half-open interval ranges, an
          Express 5 modular monolith backend, and Next.js 16 App Router frontend.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="http://localhost:4000/ready"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[6px] bg-[var(--gold-primary)] hover:bg-[var(--gold-hover)] text-white text-sm font-medium transition-colors shadow-sm"
          >
            Check API Readiness (/ready)
          </a>
          <a
            href="http://localhost:4000/health"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[6px] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-sm font-medium border border-[var(--border-default)] transition-colors"
          >
            Check Liveness (/health)
          </a>
        </div>
      </section>

      {/* Architectural Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-[var(--border-default)]">
        <div className="p-6 rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)]">
          <div className="text-xs font-mono text-[var(--text-muted)] mb-2">INVARIANT 01</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">
            Database Concurrency
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Eliminates application-level race windows using PostgreSQL native{" "}
            <code className="text-xs bg-[var(--surface-muted)] px-1 py-0.5 rounded">
              EXCLUDE USING gist
            </code>{" "}
            over{" "}
            <code className="text-xs bg-[var(--surface-muted)] px-1 py-0.5 rounded">tstzrange</code>
            .
          </p>
        </div>

        <div className="p-6 rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)]">
          <div className="text-xs font-mono text-[var(--text-muted)] mb-2">INVARIANT 02</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">
            Modular Monolith
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Express 5 modular monolith with strict domain boundaries. Zero cross-module repository
            imports; inter-module communication exclusively via typed services.
          </p>
        </div>

        <div className="p-6 rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)]">
          <div className="text-xs font-mono text-[var(--text-muted)] mb-2">INVARIANT 03</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">
            Architectural Editorial Craft
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Source Serif 4 & Space Grotesk typography on warm limestone canvas (
            <code className="text-xs bg-[var(--surface-muted)] px-1 py-0.5 rounded">#F6F4EF</code>),
            tactile 6px/8px radii, and zero AI visual tropes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
        <span>CoWorkFlow Platform &copy; 2026</span>
        <span>Architectural Editorial SaaS</span>
      </footer>
    </main>
  );
}
