import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create Supabase client with user session (respects RLS)
 * Use this for operations that need to respect user permissions
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create Supabase admin client (bypasses RLS)
 * Use this for server-side operations that need full database access
 * IMPORTANT: Only use in server-side code, never expose to client
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // TEMPORARY: Debug logging
  console.log('createAdminClient called:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceRoleKey,
    keyPrefix: supabaseServiceRoleKey?.substring(0, 20) + '...'
  })

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const error = new Error('Missing Supabase environment variables')
    console.error('Missing env vars:', {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceRoleKey
    })
    throw error
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
