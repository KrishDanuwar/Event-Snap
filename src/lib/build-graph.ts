// src/lib/build-graph.ts
// DEV-ONLY utility — strips from production build via tree-shaking
// Reads and writes the .agent/BUILD_GRAPH.md file for agent context

import type { BuildGraph, BuildGraphPhase, PhaseStatus } from '@/types/build-graph';

const PHASE_NAMES: Record<number, string> = {
  0: 'Architecture & Setup',
  1: 'Database & Storage',
  2: 'Auth & Session Architecture',
  3: 'Guest App Shell & Theme',
  4: 'Camera & Upload Pipeline',
  5: 'Gallery, Sharing & Downloads',
  6: 'Admin Dashboard Core',
  7: 'Branding, Theming & Forms',
  8: 'QR Code & PDF Export',
  9: 'Supabase Edge Functions',
  10: 'Real-Time Connections',
  11: 'Testing & QA',
  12: 'Deployment Config',
  13: 'Final Review & PR',
};

const STATUS_EMOJI: Record<PhaseStatus, string> = {
  pending: '⬜',
  'in-progress': '🔄',
  complete: '✅',
  blocked: '❌',
  partial: '⚠️',
};

/**
 * Parse the BUILD_GRAPH.md markdown content into a typed object.
 * This is a simplified parser — not a full markdown parser.
 */
export function parseBuildGraph(content: string): BuildGraph | null {
  try {
    const phases: BuildGraphPhase[] = [];

    // Extract phase status from the BUILD STATUS table
    const tableMatch = content.match(/## 🏗️ BUILD STATUS\n([\s\S]*?)(?=\n## )/);
    if (tableMatch) {
      const lines = tableMatch[1]?.split('\n') ?? [];
      for (const line of lines) {
        const match = line.match(/\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|/);
        if (match) {
          const id = parseInt(match[1] ?? '0', 10);
          const name = match[2]?.trim() ?? '';
          const statusText = match[3]?.trim() ?? '';

          let status: PhaseStatus = 'pending';
          if (statusText.includes('in-progress')) status = 'in-progress';
          else if (statusText.includes('complete')) status = 'complete';
          else if (statusText.includes('blocked')) status = 'blocked';
          else if (statusText.includes('partial')) status = 'partial';

          phases.push({
            id,
            name,
            status,
            completedAt: match[4]?.trim() || undefined,
            files: [],
            routes: [],
            notes: [],
            issues: [],
          });
        }
      }
    }

    // Find current phase (first non-complete phase)
    const currentPhase = phases.find(
      (p) => p.status === 'in-progress' || p.status === 'pending'
    )?.id ?? 0;

    return {
      lastUpdated: new Date().toISOString(),
      currentPhase,
      appDomain: '',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      packageManager: 'npm',
      graphifyEnabled: false,
      edgeFunctionsStrategy: 'supabase-cli',
      realtimePlan: 'free',
      resolvedDecisions: {},
      openQuestions: [],
      knownIssues: [],
      phases,
      apiSurface: [],
      schemaSnapshot: {},
    };
  } catch {
    return null;
  }
}

/**
 * Returns a concise summary string for the dev panel (< 300 tokens)
 */
export function summarizeBuildGraph(graph: BuildGraph): string {
  const completed = graph.phases.filter((p) => p.status === 'complete').length;
  const total = graph.phases.length;
  const current = graph.phases.find((p) => p.status === 'in-progress');
  const pending = graph.phases.filter((p) => p.status === 'pending').length;
  const blocked = graph.phases.filter((p) => p.status === 'blocked').length;

  const lines = [
    `EventSnap Build: ${completed}/${total} phases complete`,
    current
      ? `Current: Phase ${current.id} — ${current.name}`
      : `Next: Phase ${graph.currentPhase} — ${PHASE_NAMES[graph.currentPhase] ?? 'Unknown'}`,
    `Pending: ${pending} | Blocked: ${blocked}`,
    `Open questions: ${graph.openQuestions.length}`,
    `Known issues: ${graph.knownIssues.length}`,
  ];

  return lines.join('\n');
}

export { PHASE_NAMES, STATUS_EMOJI };
