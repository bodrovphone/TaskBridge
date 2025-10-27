/**
 * AuthProvider
 * Global authentication context provider
 * Maintains auth state across the entire app
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '../hooks/use-auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { UserProfile } from '@/server/domain/user/user.types'

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
