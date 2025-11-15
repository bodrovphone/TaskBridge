import { useState, useEffect } from 'react'

/**
 * Hook to detect keyboard visibility and adjust UI accordingly
 * Returns true when keyboard is likely open (viewport height significantly reduced)
 */
export function useKeyboardHeight() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    // Only run on mobile devices
    if (typeof window === 'undefined' || window.innerWidth > 640) {
      return
    }

    const initialHeight = window.visualViewport?.height || window.innerHeight

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      // Keyboard is open if viewport height reduced by more than 150px
      const keyboardOpen = initialHeight - currentHeight > 150
      setIsKeyboardOpen(keyboardOpen)
    }

    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
      }
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return isKeyboardOpen
}
