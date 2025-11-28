'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'trudify_search_location'

export interface SearchLocation {
  slug: string      // 'varna' or city name from Photon
  label: string     // 'Varna' or 'Варна' (localized display name)
  timestamp: number
}

/**
 * Hook to manage user's last searched location preference
 * Stores in localStorage for quick suggestions on return visits
 */
export function useSearchLocationPreference() {
  const [lastSearched, setLastSearched] = useState<SearchLocation | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SearchLocation
        // Validate the stored data has required fields
        if (parsed.slug && parsed.label && parsed.timestamp) {
          setLastSearched(parsed)
        }
      }
    } catch (error) {
      console.error('[useSearchLocationPreference] Error loading from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save a new location preference
  const saveLocation = useCallback((slug: string, label: string) => {
    const location: SearchLocation = {
      slug,
      label,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
      setLastSearched(location)
    } catch (error) {
      console.error('[useSearchLocationPreference] Error saving to localStorage:', error)
    }
  }, [])

  // Clear the saved location
  const clearLocation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setLastSearched(null)
    } catch (error) {
      console.error('[useSearchLocationPreference] Error clearing localStorage:', error)
    }
  }, [])

  return {
    lastSearched,
    isLoaded,
    saveLocation,
    clearLocation,
  }
}
