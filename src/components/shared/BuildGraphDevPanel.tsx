'use client';

// src/components/shared/BuildGraphDevPanel.tsx
// DEV ONLY: Floating panel showing live BUILD_GRAPH status
// Renders ONLY in development — stripped from production builds

import { useState, useEffect, useCallback } from 'react';
import { PHASE_NAMES, STATUS_EMOJI } from '@/lib/build-graph';
import type { PhaseStatus } from '@/types/build-graph';

// Hard gate: never render in production
if (process.env.NODE_ENV === 'production') {
  // This component is tree-shaken in production
}

interface PhaseDisplay {
  id: number;
  name: string;
  status: PhaseStatus;
}

const ALL_PHASES: PhaseDisplay[] = Object.entries(PHASE_NAMES).map(([id, name]) => ({
  id: parseInt(id, 10),
  name,
  status: 'pending' as PhaseStatus,
}));

export default function BuildGraphDevPanel() {
  // Never render in production
  if (process.env.NODE_ENV === 'production') return null;

  const [isOpen, setIsOpen] = useState(false);
  const [phases] = useState<PhaseDisplay[]>(ALL_PHASES);

  // Toggle with Ctrl+Shift+G
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const completed = phases.filter((p) => p.status === 'complete').length;
  const total = phases.length;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 99999,
        fontFamily: 'monospace',
        fontSize: 12,
      }}
    >
      {/* Collapsed toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#1a1a2e',
          color: '#00d4aa',
          border: '1px solid #00d4aa33',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
        title="Toggle Build Graph (Ctrl+Shift+G)"
      >
        <span style={{ fontSize: 14 }}>📊</span>
        <span>
          {completed}/{total}
        </span>
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            right: 0,
            width: 320,
            background: '#1a1a2e',
            border: '1px solid #00d4aa33',
            borderRadius: 12,
            padding: 16,
            color: '#e0e0e0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, color: '#00d4aa', fontSize: 14 }}>
              EventSnap Build Graph
            </h3>
            <span style={{ color: '#888', fontSize: 10 }}>Ctrl+Shift+G</span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: '#2a2a3e',
              borderRadius: 4,
              height: 6,
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(90deg, #00d4aa, #6366f1)',
                height: '100%',
                width: `${(completed / total) * 100}%`,
                transition: 'width 0.3s ease',
                borderRadius: 4,
              }}
            />
          </div>

          {/* Phase list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {phases.map((phase) => (
              <div
                key={phase.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                  opacity: phase.status === 'complete' ? 0.6 : 1,
                }}
              >
                <span style={{ width: 20, textAlign: 'center' }}>
                  {STATUS_EMOJI[phase.status]}
                </span>
                <span style={{ color: '#888', width: 20, textAlign: 'right' }}>
                  {phase.id}
                </span>
                <span
                  style={{
                    flex: 1,
                    color:
                      phase.status === 'in-progress'
                        ? '#00d4aa'
                        : phase.status === 'blocked'
                          ? '#ff6b6b'
                          : '#e0e0e0',
                  }}
                >
                  {phase.name}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 8,
              borderTop: '1px solid #2a2a3e',
              color: '#666',
              fontSize: 10,
            }}
          >
            Dev-only panel · Hidden in production
          </div>
        </div>
      )}
    </div>
  );
}
