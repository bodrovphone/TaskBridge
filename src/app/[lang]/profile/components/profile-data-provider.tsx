'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/features/auth'
import { UserProfile } from '@/server/domain/user/user.types'

interface ProfileDataProviderProps {
  children: (props: {
    profile: UserProfile | null
    isLoading: boolean
    error: string | null
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  }) => React.ReactNode
}

/**
 * Profile Data Provider
 * Handles data fetching and updates for profile components
 * Provides clean API for child components without prop drilling
 */
export function ProfileDataProvider({ children }: ProfileDataProviderProps) {
  const { profile: authProfile, user, refreshProfile, authenticatedFetch } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const currentLocale = (params?.lang as string) || 'bg'

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Pass locale to trigger translation for non-BG content
      const response = await authenticatedFetch(`/api/profile?locale=${currentLocale}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Refresh profile from auth context
      if (refreshProfile) {
        await refreshProfile()
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, refreshProfile, authenticatedFetch, currentLocale])

  return children({
    profile: authProfile,
    isLoading,
    error,
    updateProfile,
  })
}
