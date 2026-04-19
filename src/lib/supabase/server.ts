// src/lib/supabase/server.ts
// Server-side Supabase client (service role key)
// MUST NEVER be imported in client-side code

// Guard: throw immediately if imported in browser
if (typeof window !== 'undefined') {
  throw new Error(
    'supabase/server.ts must never be imported client-side. ' +
    'Use supabase/client.ts instead.'
  );
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with service role key.
 * This bypasses RLS — use only in API routes and server actions.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
