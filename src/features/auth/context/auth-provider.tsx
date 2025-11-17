'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '../hooks/use-auth'

type AuthContextType = ReturnType<typeof useAuthHook>

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
