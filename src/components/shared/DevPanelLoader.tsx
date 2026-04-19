'use client';

// src/components/shared/DevPanelLoader.tsx
// Client component wrapper for loading BuildGraphDevPanel
// This exists solely because dynamic({ ssr: false }) requires a Client Component in Next.js 16

import dynamic from 'next/dynamic';

const BuildGraphDevPanel = dynamic(
  () => import('@/components/shared/BuildGraphDevPanel'),
  { ssr: false }
);

export default function DevPanelLoader() {
  if (process.env.NODE_ENV === 'production') return null;
  return <BuildGraphDevPanel />;
}
