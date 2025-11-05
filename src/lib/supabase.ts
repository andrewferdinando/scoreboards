import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client (uses anon key, respects RLS)
// Uses createBrowserClient from @supabase/ssr to ensure single instance
// Returns a client even if env vars are missing (will fail gracefully at runtime)
// Create as a singleton to prevent multiple instances
let browserClient: ReturnType<typeof createBrowserClient> | null = null

function getBrowserClient() {
  // Only create client on client-side
  if (typeof window === 'undefined') {
    // Server-side: return a mock client that won't cause errors
    // This prevents SSR errors but the client should only be used client-side
    return {
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Client-side only' } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      }),
    } as any
  }
  
  // Client-side: return singleton instance
  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
  }
  return browserClient
}

export const supabase = getBrowserClient()

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

