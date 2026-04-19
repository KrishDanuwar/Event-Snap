// supabase/functions/auto-delete-expired/index.ts
// TODO: Phase 9 — Supabase Edge Function
// Triggered hourly via pg_cron
// Finds expired events and deletes all associated data

// import { Zip, AsyncZipDeflate } from 'fflate';

Deno.serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({ message: 'Not implemented — Phase 9' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } }
  );
});
