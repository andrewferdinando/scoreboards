import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client (uses anon key, respects RLS)
// Uses createBrowserClient from @supabase/ssr to ensure single instance
// Returns a client even if env vars are missing (will fail gracefully at runtime)
// Create as a singleton to prevent multiple instances
let browserClient: ReturnType<typeof createBrowserClient> | null = null

// Client-side Supabase client - create immediately but safely
// createBrowserClient from @supabase/ssr handles SSR gracefully
export const supabase = typeof window !== 'undefined' 
  ? (browserClient || (browserClient = createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )))
  : createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )

// Server-side Supabase client (uses service role key, bypasses RLS)
// Only use this in API routes, server components, or server actions
export const supabaseAdmin = createSupabaseClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey || 'placeholder-key'
)

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co')
}

