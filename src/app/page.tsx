import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EventSnap — Live Event Photo Sharing',
  description: 'Capture and share photos at live events. No app install required.',
};

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 16,
        }}
      >
        📸
      </div>

      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #6366f1, #00d4aa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 12,
          letterSpacing: '-0.03em',
        }}
      >
        EventSnap
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#a0a0b0',
          maxWidth: 500,
          lineHeight: 1.6,
          marginBottom: 32,
        }}
      >
        Live event photo sharing. Scan, snap, share — no app install required.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 16,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          🔐 Admin Dashboard
        </Link>
      </div>

      {/* Footer */}
      <p
        style={{
          position: 'absolute',
          bottom: 24,
          color: '#555',
          fontSize: 13,
        }}
      >
        EventSnap v0.1.0 — Phase 0 Complete
      </p>
    </div>
  );
}
