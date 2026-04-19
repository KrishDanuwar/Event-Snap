import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EventSnap — Live Event Photo Sharing',
  description: 'Capture and share photos at live events. No app install required.',
};

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
      
      {/* Decorative Blur Background */}
      <div className="absolute top-0 -z-10 h-full w-full bg-white">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/5 opacity-50 blur-[80px]"></div>
      </div>

      {/* Hero Content */}
      <div className="animate-slide-up space-y-6 max-w-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm border border-primary/20">
          <span className="text-4xl">📸</span>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          Event<span className="text-primary">Snap</span>
        </h1>

        <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed max-w-[500px] mx-auto">
          Live event photo sharing made seamless. Scan, snap, and share — no app install required.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/admin"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-sm text-muted-foreground font-medium">
        EventSnap v0.1.0 — Phase 0
      </p>
    </div>
  );
}
