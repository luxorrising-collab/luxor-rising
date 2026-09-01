import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase admin client. It uses the project's SECRET key, which
// bypasses Row Level Security — so it must NEVER be imported into a client
// component. Every customer / enquiry / booking write goes through here, from
// route handlers, server actions and the Stripe webhook.
//
// Env (server-only, not NEXT_PUBLIC):
//   SUPABASE_URL         = https://<project-ref>.supabase.co
//   SUPABASE_SECRET_KEY  = sb_secret_...  (Dashboard → Project settings → API keys)

let _client: SupabaseClient | null = null;

/** Returns the admin client, or null when Supabase isn't configured yet. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  _client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** Same, but throws if unconfigured — use where Supabase is required. */
export function requireSupabaseAdmin(): SupabaseClient {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error(
      "Supabase is not configured — set SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }
  return client;
}
