// supabase/functions/export-event-zip/index.ts
// TODO: Phase 9 — Supabase Edge Function
// Streams a ZIP of all event photos for admin download
// Folder structure: {guestName}/{photoId}.jpg

// import { Zip, AsyncZipDeflate } from 'fflate';

Deno.serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({ message: 'Not implemented — Phase 9' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } }
  );
});
