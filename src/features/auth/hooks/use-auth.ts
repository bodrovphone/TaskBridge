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

  // Auth methods
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithFacebook: () => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

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
   * Initialize auth state
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase.auth])

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      // Explicitly create profile in users table
      // This ensures the profile exists even if email confirmation is required
      if (data.session) {
        try {
          await fetch('/api/auth/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fullName: fullName,
            }),
          })
        } catch (err) {
          console.error('Failed to create profile after signup:', err)
          // Profile will be created by onAuthStateChange listener as fallback
        }
      }

      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Sign in with email and password
   */
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
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

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

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

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Facebook'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Sign out
   */
  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      setProfile(null)
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      setError(message)
      return { error: message }
    }
  }

  /**
   * Manually refresh profile data
   */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    refreshProfile,
  }
}
