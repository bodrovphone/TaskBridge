'use client'

import { useEffect, useRef, useState } from 'react'
import { useIsDesktop } from '@/hooks/use-media-query'
import Image from 'next/image'

interface OptimizedVideoHeroProps {
 videoSrc: string
 poster: string
 alt: string
 className?: string
 width?: number
 height?: number
 maxHeight?: string
}

/**
 * Performance-optimized video component for hero sections
 *
 * Features:
 * - Desktop only (mobile shows static image)
 * - Lazy loads after initial page paint
 * - Pauses during scroll for smooth performance
 * - GPU-accelerated rendering
 * - Fallback to poster image on error
 */
export default function OptimizedVideoHero({
 videoSrc,
 poster,
 alt,
 className = '',
 width = 800,
 height = 600,
 maxHeight = '420px'
}: OptimizedVideoHeroProps) {
 const isDesktop = useIsDesktop()
 const videoRef = useRef<HTMLVideoElement>(null)
 const [isLoaded, setIsLoaded] = useState(false)
 const [hasError, setHasError] = useState(false)
 const [isScrolling, setIsScrolling] = useState(false)

 // Pause video during scroll for smooth scrolling
 useEffect(() => {
  if (!isDesktop || !videoRef.current) return

  let scrollTimeout: NodeJS.Timeout

  const handleScroll = () => {
   setIsScrolling(true)

   // Pause video while scrolling
   if (videoRef.current && !videoRef.current.paused) {
    videoRef.current.pause()
   }

   // Resume after scroll stops
   clearTimeout(scrollTimeout)
   scrollTimeout = setTimeout(() => {
    setIsScrolling(false)
    if (videoRef.current && videoRef.current.paused) {
     videoRef.current.play().catch(() => {
      // Autoplay blocked, that's ok
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

 // Lazy load video after initial page paint
 useEffect(() => {
  if (!isDesktop) return

  // Wait for initial page load
  const timer = setTimeout(() => {
   if (videoRef.current) {
    videoRef.current.load()
   }
  }, 300) // 300ms delay to let page render first

  return () => clearTimeout(timer)
 }, [isDesktop])

 const handleVideoLoad = () => {
  setIsLoaded(true)
  if (videoRef.current) {
   videoRef.current.play().catch(() => {
    console.log('Autoplay blocked - video will play when user scrolls')
   })
  }
 }

 const handleVideoError = () => {
  console.error('Video failed to load, showing poster image')
  setHasError(true)
 }

 // Show static image on mobile or if video errors
 if (!isDesktop || hasError) {
  return (
   <div style={{ width: '100%', height: maxHeight, position: 'relative' }}>
    <Image
     src={poster}
     alt={alt}
     fill
     sizes="(max-width: 1024px) 100vw, 50vw"
     className={`${className} object-cover`}
     priority
     fetchPriority="high"
    />
   </div>
  )
 }

 return (
  <div style={{ width: '100%', height: maxHeight, position: 'relative' }}>
   {/* Poster image - shown until video loads */}
   {!isLoaded && (
    <Image
     src={poster}
     alt={alt}
     fill
     sizes="(max-width: 1024px) 100vw, 50vw"
     className={`${className} object-cover`}
     priority
     fetchPriority="high"
    />
   )}

   {/* Optimized video with WebM + MP4 fallback */}
   <video
    ref={videoRef}
    autoPlay
    loop
    muted
    playsInline
    preload="none"
    className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} absolute inset-0 w-full h-full object-cover transition-opacity duration-500`}
    style={{
     // Force GPU acceleration
     transform: 'translateZ(0)',
     backfaceVisibility: 'hidden',
     willChange: 'auto', // Don't use will-change: transform on video
    }}
    onLoadedData={handleVideoLoad}
    onError={handleVideoError}
   >
    {/* WebM first (smaller, better quality for modern browsers) */}
    <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
    {/* MP4 fallback (Safari/iOS compatibility) */}
    <source src={videoSrc} type="video/mp4" />
    Your browser does not support the video tag.
   </video>
  </div>
 )
}

OptimizedVideoHero.displayName = 'OptimizedVideoHero'
