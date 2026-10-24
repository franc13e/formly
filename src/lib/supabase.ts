import type { SupabaseClient } from "@supabase/supabase-js";

interface PublicConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
}

function isPublicConfig(value: unknown): value is PublicConfig {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const ok = (x: unknown) => x === null || typeof x === "string";
  return ok(v.supabaseUrl) && ok(v.supabaseAnonKey);
}

/**
 * Resolves the Supabase client, or null when accounts aren't configured
 * (the app then runs local-only, exactly as before).
 *
 * Build-time `VITE_SUPABASE_*` variables win (handy for local dev); otherwise the
 * public URL and anon key are read from the backend's `/api/config`, which picks
 * them up from the Vercel ↔ Supabase integration.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  let url = import.meta.env.VITE_SUPABASE_URL ?? "";
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

  if (!url || !key) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/config`);
      const body: unknown = res.ok ? await res.json() : null;
      if (isPublicConfig(body)) {
        url = body.supabaseUrl ?? "";
        key = body.supabaseAnonKey ?? "";
      }
    } catch {
      // Backend unreachable: fall back to local-only mode.
    }
  }

  if (!url || !key) return null;
  // Loaded on demand so local-only visitors don't download the Supabase SDK.
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
}
