'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'

// Configure nprogress
NProgress.configure({
  showSpinner: false, // Hide the spinner, keep only the bar
  trickleSpeed: 100, // Faster trickle for more visible animation
  minimum: 0.1,
  easing: 'linear',
  speed: 400,
})

export default function ProgressBar() {
  const pathname = usePathname()
  // Only track pathname changes, not searchParams
  // This prevents the progress bar from showing on filter/search changes
  // which are handled via router.replace with scroll: false
  const prevPathname = useRef(pathname)
  const cssLoaded = useRef(false)

  // Lazy load CSS on mount (non-blocking)
  useEffect(() => {
    if (!cssLoaded.current) {
      import('@/app/nprogress.css')
      cssLoaded.current = true
    }
  }, [])

  useEffect(() => {
    // Only show progress bar when actual page (pathname) changes
    // Skip for search param changes (filters, pagination, etc.)
    if (pathname === prevPathname.current) {
      return
    }
    prevPathname.current = pathname

    // Start progress bar on route change
    NProgress.start()

    // Complete progress bar after a longer delay so it's visible
    const timer = setTimeout(() => {
      NProgress.done()
    }, 800) // Increased from 100ms to 800ms

    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [pathname])

  return null
}
