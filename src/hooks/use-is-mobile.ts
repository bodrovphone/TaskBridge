'use client'

import { useEffect, useState } from 'react'

/**
 * Modern hook to detect mobile devices using matchMedia API
 *
 * @param breakpoint - Tailwind breakpoint (default: 'sm' = 640px)
 * @returns boolean indicating if viewport is below the breakpoint
 *
 * @example
 * const isMobile = useIsMobile() // < 640px
 * const isTablet = useIsMobile('md') // < 768px
 * const isSmallDesktop = useIsMobile('lg') // < 1024px
 */
export function useIsMobile(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'sm'): boolean {
  // Tailwind breakpoints
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }

  const query = `(max-width: ${breakpoints[breakpoint]})`

  // Initialize with false to avoid hydration mismatch
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Create MediaQueryList object
    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Modern event listener (supports Safari 14+)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Use addEventListener instead of deprecated addListener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
