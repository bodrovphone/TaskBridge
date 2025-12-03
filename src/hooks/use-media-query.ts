import { useState, useEffect, useCallback } from 'react'

/**
 * SSR-safe media query hook that avoids hydration mismatches.
 * Returns false during SSR and initial render, then updates to actual value.
 * Uses useCallback for stable listener reference.
 */
export function useMediaQuery(query: string): boolean {
  // Start with false to match SSR output and avoid hydration mismatch
  const [matches, setMatches] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const updateMatches = useCallback(() => {
    if (typeof window !== 'undefined') {
      setMatches(window.matchMedia(query).matches)
    }
  }, [query])

  useEffect(() => {
    // Mark as mounted and get initial value
    setHasMounted(true)
    updateMatches()

    const media = window.matchMedia(query)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [query, updateMatches])

  // During SSR or before hydration, return false to match initial state
  if (!hasMounted) {
    return false
  }

  return matches
}

// Preset media queries
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px)')
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')