'use client'

import { useEffect, useRef, useState } from 'react'
import { useIsDesktop } from '@/hooks/use-media-query'

/**
 * Hero Video Background - Client Component
 *
 * Only loads on desktop - mobile uses the gradient fallback.
 * Fades in smoothly after loading to avoid jarring appearance.
 */
export function HeroVideoBackground() {
  const isDesktop = useIsDesktop()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Pause video during scroll for smooth performance
  useEffect(() => {
    if (!isDesktop || !videoRef.current) return

    let scrollTimeout: NodeJS.Timeout
    let wasPlaying = false

    const handleScroll = () => {
      if (videoRef.current && !videoRef.current.paused) {
        wasPlaying = true
        videoRef.current.pause()
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        if (videoRef.current && wasPlaying) {
          videoRef.current.play().catch(() => {})
        }
      }, 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [isDesktop])

  // Lazy load video after mount
  useEffect(() => {
    if (!isDesktop) return

    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isDesktop])

  const handleVideoLoad = () => {
    setIsLoaded(true)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  // Don't render video on mobile
  if (!isDesktop) return null

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      className={`absolute inset-0 z-[1] w-full h-full object-cover transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
      onLoadedData={handleVideoLoad}
    >
      <source src="/assets/hero_video_1.webm" type="video/webm" />
      <source src="/assets/hero_video_1.mp4" type="video/mp4" />
    </video>
  )
}
