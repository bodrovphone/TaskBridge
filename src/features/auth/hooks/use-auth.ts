/**
 * useAuth Hook
 * Client-side authentication hook using Supabase
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import type { UserProfile } from '@/server/domain/user/user.types'

interface UseAuthReturn {
  // Auth state
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  notificationToken: string | null

  // Auth methods
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithFacebook: () => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>

  // Authenticated fetch wrapper
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notificationToken, setNotificationToken] = useState<string | null>(null)

  // Ref to track if user is authenticated (for use in callbacks/intervals)
  const isAuthenticatedRef = useRef(false)

  // Note: We no longer create a Supabase client here to avoid CORS issues
  // All auth operations go through our API routes

  /**
   * Handle notification session auto-login
   */
  const handleNotificationSession = useCallback(async (token: string) => {
    try {
      console.log('🔐 Handling notification session token...')

      const response = await fetch('/api/auth/validate-notification-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        console.error('❌ Notification session validation failed')
        setLoading(false)
        return
      }

      const data = await response.json()

      // Store the notification token for API authentication
      if (data.notificationToken && data.user) {
        setNotificationToken(data.notificationToken)
        setProfile(data.user)
        // Create user object to match normal auth flow
        const userObj: SupabaseUser = {
          id: data.user.id,
          email: data.user.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: data.user.created_at || new Date().toISOString(),
        }
        setUser(userObj)
        setLoading(false)
        console.log('✅ Notification session authenticated:', data.user.email)
      } else {
        console.error('❌ No user data or token in response')
        setError('Invalid response from server')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Notification session error:', err)
      setError('Failed to authenticate via notification link')
      setLoading(false)
    }
  }, [])

  /**
   * Check and update auth state from API
   */
  const checkAuthState = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/profile')

      if (response.ok) {
        const data = await response.json()
        const userObj: SupabaseUser = {
          id: data.user.id,
          email: data.user.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: data.user.createdAt || new Date().toISOString(),
        }
        setUser(userObj)
        setProfile(data.user)
        isAuthenticatedRef.current = true
        return true
      } else if (response.status === 404) {
        // 404 means auth user exists but no profile - create it
        console.log('[useAuth] Profile not found, creating...')
        const createResponse = await fetch('/api/auth/profile', {
          method: 'POST',
        })

        if (createResponse.ok) {
          const data = await createResponse.json()
          const userObj: SupabaseUser = {
            id: data.user.id,
            email: data.user.email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: data.user.createdAt || new Date().toISOString(),
          }
          setUser(userObj)
          setProfile(data.user)
          isAuthenticatedRef.current = true
          console.log('[useAuth] Profile created successfully')
          return true
        } else {
          console.error('[useAuth] Failed to create profile:', await createResponse.text())
          setUser(null)
          setProfile(null)
          isAuthenticatedRef.current = false
          return false
        }
      } else {
        // 401 or other error - not authenticated
        setUser(null)
        setProfile(null)
        isAuthenticatedRef.current = false
        return false
      }
    } catch (err) {
      console.error('[useAuth] Error checking auth status:', err)
      setUser(null)
      setProfile(null)
      isAuthenticatedRef.current = false
      return false
    }
  }, [])

  /**
   * Check if auth cookies exist (quick client-side check to avoid unnecessary API calls)
   */
  const hasAuthCookies = (): boolean => {
    if (typeof document === 'undefined') return false
    // Supabase auth cookies start with 'sb-' and contain 'auth-token'
    return document.cookie.split(';').some(c => c.trim().startsWith('sb-') && c.includes('auth-token'))
  }

  /**
   * Initialize auth state and set up listeners
   */
  useEffect(() => {
    // Check for notification session token in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const notificationToken = params.get('notificationSession')

      if (notificationToken) {
        console.log('🔗 Detected notification session token in URL')
        handleNotificationSession(notificationToken)
        return // Skip normal auth flow when using notification session
      }
    }

    // Quick check: if no auth cookies exist, skip API call entirely (faster LCP)
    if (!hasAuthCookies()) {
      console.log('[useAuth] No auth cookies found, skipping profile fetch')
      setLoading(false)
      return
    }

    // Initial auth check (only if cookies suggest user might be authenticated)
    checkAuthState().finally(() => setLoading(false))

    // Set up Supabase auth state change listener for token refresh
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log('[useAuth] Auth state changed:', event)

        if (event === 'TOKEN_REFRESHED') {
          console.log('[useAuth] Token refreshed, updating state...')
          await checkAuthState()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          isAuthenticatedRef.current = false
        } else if (event === 'SIGNED_IN') {
          await checkAuthState()
        }
      }
    )

    // Refresh session when tab becomes visible (handles returning after idle)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticatedRef.current) {
        console.log('[useAuth] Tab visible, refreshing session...')
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            // Session is valid, just refresh the profile to sync state
            checkAuthState()
          } else {
            // Session expired, clear auth state
            console.log('[useAuth] Session expired')
            setUser(null)
            setProfile(null)
            isAuthenticatedRef.current = false
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Periodic session refresh every 10 minutes (Supabase tokens expire in 1 hour)
    const refreshInterval = setInterval(() => {
      if (isAuthenticatedRef.current) {
        console.log('[useAuth] Periodic session refresh...')
        supabase.auth.getSession()
      }
    }, 10 * 60 * 1000) // 10 minutes

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(refreshInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  /**
   * Sign up with email and password (via API route)
   */
  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null)

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return { error: data.error }
      }

      // Fetch the profile after successful signup (via API)
      if (data.user) {
        const userObj: SupabaseUser = {
          id: data.user.id,
          email: data.user.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: data.user.createdAt || new Date().toISOString(),
        }
        setUser(userObj)
        setProfile(data.user)
      }

      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up. Please try again.'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Sign in with email and password (via API route)
   */
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return { error: data.error }
      }

      // Fetch the profile after successful login (via API)
      if (data.user) {
        const userObj: SupabaseUser = {
          id: data.user.id,
          email: data.user.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: data.user.createdAt || new Date().toISOString(),
        }
        setUser(userObj)
        setProfile(data.user)
      }

      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please try again.'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      setError(null)
      const supabase = createClient()

      // Extract current locale from URL path (e.g., /bg/tasks -> bg)
      const pathLocale = window.location.pathname.match(/^\/(en|bg|ru|ua)\//)?.[1] || 'bg'

      // Store locale in cookie BEFORE OAuth redirect (most reliable way to preserve it)
      // The callback will read this cookie if the query param is lost during OAuth flow
      document.cookie = `NEXT_LOCALE=${pathLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

      // Store the current page URL to redirect back after auth
      const currentPageUrl = window.location.href

      // Pass locale and redirect URL so callback can redirect back to current page
      const redirectTo = `${window.location.origin}/auth/callback?locale=${pathLocale}&next=${encodeURIComponent(currentPageUrl)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      // The redirect will happen automatically
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Sign in with Facebook OAuth
   */
  const signInWithFacebook = async (): Promise<{ error: string | null }> => {
    try {
      setError(null)
      const supabase = createClient()

      // Extract current locale from URL path (e.g., /bg/tasks -> bg)
      const pathLocale = window.location.pathname.match(/^\/(en|bg|ru|ua)\//)?.[1] || 'bg'

      // Store locale in cookie BEFORE OAuth redirect (most reliable way to preserve it)
      // The callback will read this cookie if the query param is lost during OAuth flow
      document.cookie = `NEXT_LOCALE=${pathLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

      // Store the current page URL to redirect back after auth
      const currentPageUrl = window.location.href

      // Pass locale and redirect URL so callback can redirect back to current page
      const redirectTo = `${window.location.origin}/auth/callback?locale=${pathLocale}&next=${encodeURIComponent(currentPageUrl)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo,
          // Use public_profile only for now (email requires Facebook App Review)
          // Once Privacy Policy and Terms are published, request email permission
          scopes: 'public_profile',
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      // The redirect will happen automatically
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Facebook'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Sign out (via API route)
   */
  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      setError(null)

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return { error: data.error }
      }

      setUser(null)
      setProfile(null)
      isAuthenticatedRef.current = false
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out. Please try again.'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Manually refresh profile data
   * Fetches fresh profile from API and updates state
   */
  const refreshProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile')

      if (response.ok) {
        const data = await response.json()
        const userObj: SupabaseUser = {
          id: data.user.id,
          email: data.user.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: data.user.createdAt || new Date().toISOString(),
        }
        setUser(userObj)
        setProfile(data.user)
      } else {
        // Not authenticated
        setUser(null)
        setProfile(null)
      }
    } catch (err) {
      console.error('[useAuth] Error refreshing profile:', err)
    }
  }

  /**
   * Authenticated fetch wrapper - automatically includes notification token if present
   */
  const authenticatedFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const headers = new Headers(options?.headers)

      // Add notification token if available
      if (notificationToken) {
        headers.set('Authorization', `NotificationToken ${notificationToken}`)
      }

      return fetch(url, {
        ...options,
        headers,
      })
    },
    [notificationToken]
  )

  return {
    user,
    profile,
    loading,
    error,
    notificationToken,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    refreshProfile,
    authenticatedFetch,
  }
}
