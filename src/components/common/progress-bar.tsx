'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
// Don't import default nprogress.css - we use our custom styles

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
  const searchParams = useSearchParams()

  useEffect(() => {
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
  }, [pathname, searchParams])

  return null
}
