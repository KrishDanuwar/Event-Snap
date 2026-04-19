// src/types/build-graph.ts
// TypeScript types for BUILD_GRAPH system (dev-only)

export type PhaseStatus = 'pending' | 'in-progress' | 'complete' | 'blocked' | 'partial';

export interface BuildGraphPhase {
  id: number;
  name: string;
  status: PhaseStatus;
  completedAt?: string;
  files: string[];
  routes: string[];
  notes: string[];
  issues: string[];
}

export interface ApiRoute {
  method: string;
  path: string;
  auth: string;
  status: string;
}

export interface BuildGraph {
  lastUpdated: string;
  currentPhase: number;
  appDomain: string;
  supabaseUrl: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  graphifyEnabled: boolean;
  edgeFunctionsStrategy: 'supabase-cli' | 'next-api-routes';
  realtimePlan: 'free' | 'pro';
  resolvedDecisions: Record<string, string | boolean>;
  openQuestions: string[];
  knownIssues: string[];
  phases: BuildGraphPhase[];
  apiSurface: ApiRoute[];
  schemaSnapshot: Record<string, string[]>; // table → columns
}
