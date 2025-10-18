'use client'

import { useEffect, useRef, useState } from 'react'
import { useIsDesktop } from '@/hooks/use-media-query'

interface OptimizedVideoBackgroundProps {
 videoSrc: string
 fallbackGradient?: string
 overlayOpacity?: number
 children: React.ReactNode
}

/**
 * Performance-optimized video background for hero sections
 *
 * Key optimizations:
 * - Desktop only (mobile shows gradient)
 * - Pauses during scroll for 60fps scrolling
 * - Lazy loads after page paint
 * - GPU-accelerated
 */
export default function OptimizedVideoBackground({
 videoSrc,
 fallbackGradient = 'from-blue-600 via-blue-700 to-emerald-600',
 overlayOpacity = 0.5,
 children
}: OptimizedVideoBackgroundProps) {
 const isDesktop = useIsDesktop()
 const videoRef = useRef<HTMLVideoElement>(null)
 const [isLoaded, setIsLoaded] = useState(false)
 const [hasError, setHasError] = useState(false)

 // Pause video during scroll for smooth performance
 useEffect(() => {
  if (!isDesktop || !videoRef.current) return

  let scrollTimeout: NodeJS.Timeout
  let wasPlaying = false

  const handleScroll = () => {
   // Pause video while scrolling
   if (videoRef.current && !videoRef.current.paused) {
    wasPlaying = true
    videoRef.current.pause()
   }

   // Resume after scroll stops
   clearTimeout(scrollTimeout)
   scrollTimeout = setTimeout(() => {
    if (videoRef.current && wasPlaying) {
     videoRef.current.play().catch(() => {
      // Autoplay might be blocked
     })
    }
   }, 300) // Resume 300ms after scroll stops (debounced)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => {
   window.removeEventListener('scroll', handleScroll)
   clearTimeout(scrollTimeout)
  }
 }, [isDesktop])

 // Lazy load video
 useEffect(() => {
  if (!isDesktop) return

  const timer = setTimeout(() => {
   if (videoRef.current) {
    videoRef.current.load()
   }
  }, 300)

  return () => clearTimeout(timer)
 }, [isDesktop])

 const handleVideoLoad = () => {
  setIsLoaded(true)
  if (videoRef.current) {
   videoRef.current.play().catch(() => {
    console.log('Autoplay blocked')
   })
  }
 }

 const handleVideoError = () => {
  setHasError(true)
  setIsLoaded(false)
 }

 return (
  <div className="relative overflow-hidden">
   {/* Fallback gradient - always visible */}
   <div className={`absolute inset-0 bg-gradient-to-r ${fallbackGradient}`} />

   {/* Video - desktop only, with smooth fade-in */}
   {!hasError && isDesktop && (
    <video
     ref={videoRef}
     autoPlay
     loop
     muted
     playsInline
     preload="none"
     className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
     }`}
     style={{
      // GPU acceleration
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
     }}
     onLoadedData={handleVideoLoad}
     onError={handleVideoError}
    >
     <source src={videoSrc} type="video/mp4" />
    </video>
   )}

   {/* Dark overlay */}
   <div
    className="absolute inset-0 bg-black transition-opacity duration-1000"
    style={{ opacity: isLoaded ? overlayOpacity : 0.3 }}
   />

   {/* Content */}
   <div className="relative z-10">{children}</div>
  </div>
 )
}

OptimizedVideoBackground.displayName = 'OptimizedVideoBackground'
