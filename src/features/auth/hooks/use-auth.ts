/**
 * useAuth Hook
 * Client-side authentication hook using Supabase
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
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

  // Note: We no longer create a Supabase client here to avoid CORS issues
  // All auth operations go through our API routes

  /**
   * Fetch user profile from our API
   */
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch('/api/auth/profile')

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else if (response.status === 404) {
        // Profile doesn't exist yet - create it
        const createResponse = await fetch('/api/auth/profile', {
          method: 'POST',
        })

        if (createResponse.ok) {
          const data = await createResponse.json()
          setProfile(data.user)
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    }
  }, [])

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
        setLoading(false)
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
   * Initialize auth state
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

    // Check auth via our API route instead of directly calling Supabase
    fetch('/api/auth/profile')
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json()
          // Create a minimal user object from profile data
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
          setLoading(false)
        } else if (response.status === 404) {
          // 404 means auth user exists but no profile - create it
          console.log('[useAuth] Profile not found, creating...')
          try {
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
              console.log('[useAuth] Profile created successfully')
            } else {
              console.error('[useAuth] Failed to create profile:', await createResponse.text())
              setUser(null)
              setProfile(null)
            }
          } catch (err) {
            console.error('[useAuth] Error creating profile:', err)
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        } else {
          // 401 or other error - not authenticated
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('[useAuth] Error checking auth status:', err)
        setUser(null)
        setProfile(null)
        setLoading(false)
      })

    // Note: We no longer use onAuthStateChange to avoid CORS issues
    // Auth state changes will be detected when components refetch data after login/logout
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

      // Pass locale in redirect URL so callback can preserve it
      const redirectTo = `${window.location.origin}/auth/callback?locale=${pathLocale}`

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

      // Pass locale in redirect URL so callback can preserve it
      const redirectTo = `${window.location.origin}/auth/callback?locale=${pathLocale}`

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

      setProfile(null)
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
