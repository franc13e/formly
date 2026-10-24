/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the AI backend. Empty/undefined means same-origin (`/api/...`). */
  readonly VITE_API_URL?: string
  /** Optional build-time Supabase config (otherwise read from the backend's /api/config). */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
