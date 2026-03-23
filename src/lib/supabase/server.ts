import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service role client — only for server-side API routes.
// Bypasses RLS; NEVER import in 'use client' components.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Anon client for server components (read-only, respects RLS)
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
