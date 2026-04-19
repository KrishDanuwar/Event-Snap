// src/lib/supabase/client.ts
// Browser-side Supabase client (anon key only)
// This client is safe for client components

import { createBrowserClient as createSupabaseClient } from '@supabase/ssr';

export function createBrowserClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
