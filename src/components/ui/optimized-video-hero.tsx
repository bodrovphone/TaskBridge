'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface OptimizedVideoHeroProps {
 videoSrc: string
 poster: string
 alt: string
 className?: string
 width?: number
 height?: number
 maxHeight?: string
 /**
  * When true, disables priority/preload for the image.
  * Use this when the component is hidden on mobile to prevent
  * unnecessary image downloads on mobile devices.
  */
 desktopOnly?: boolean
}

/**
 * Performance-optimized video component for hero sections
 *
 * LCP Optimized Architecture:
 * 1. Image renders IMMEDIATELY (SSR) - no JS needed
 * 2. Video loads ONLY on desktop AFTER hydration
 * 3. Image stays visible until video is ready
 *
 * This ensures fast LCP by not blocking on JS hydration.
 */
export default function OptimizedVideoHero({
 videoSrc,
 poster,
 alt,
 className = '',
 maxHeight = '420px',
 desktopOnly = false
}: OptimizedVideoHeroProps) {
 const videoRef = useRef<HTMLVideoElement>(null)

 // Start with image-only mode (SSR safe)
 const [showVideo, setShowVideo] = useState(false)
 const [videoReady, setVideoReady] = useState(false)
 const [hasError, setHasError] = useState(false)

 // After hydration, check if desktop and enable video
 useEffect(() => {
  // Check if desktop (width > 1024px)
  const isDesktop = window.innerWidth > 1024

  if (isDesktop) {
   // Small delay to prioritize LCP image
   const timer = setTimeout(() => {
    setShowVideo(true)
   }, 100)
   return () => clearTimeout(timer)
  }
 }, [])

 // Handle video loading
 useEffect(() => {
  if (!showVideo || !videoRef.current) return

  const video = videoRef.current

  const handleCanPlay = () => {
   setVideoReady(true)
   video.play().catch(() => {
    // Autoplay blocked, keep showing image
    console.log('Autoplay blocked')
   })
  }

  const handleError = () => {
   console.error('Video failed to load')
   setHasError(true)
   setShowVideo(false)
  }

  video.addEventListener('canplay', handleCanPlay)
  video.addEventListener('error', handleError)

  // Start loading video
  video.load()

  return () => {
   video.removeEventListener('canplay', handleCanPlay)
   video.removeEventListener('error', handleError)
  }
 }, [showVideo])

 // Pause video during scroll for smooth scrolling
 useEffect(() => {
  if (!showVideo || !videoReady || !videoRef.current) return

  let scrollTimeout: NodeJS.Timeout

  const handleScroll = () => {
   if (videoRef.current && !videoRef.current.paused) {
    videoRef.current.pause()
   }

   clearTimeout(scrollTimeout)
   scrollTimeout = setTimeout(() => {
    if (videoRef.current && videoRef.current.paused) {
     videoRef.current.play().catch(() => {})
    }
   }, 300)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => {
   window.removeEventListener('scroll', handleScroll)
   clearTimeout(scrollTimeout)
  }
 }, [showVideo, videoReady])

 return (
  <div style={{ width: '100%', height: maxHeight, position: 'relative' }}>
   {/*
    * PRIMARY LCP ELEMENT - Always rendered (SSR)
    * This image loads immediately without waiting for JS
    * Stays visible until video is ready (on desktop)
    * When desktopOnly=true, we disable priority to prevent preloading on mobile
    */}
   <Image
    src={poster}
    alt={alt}
    fill
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 450px, 600px"
    className={`${className} object-cover transition-opacity duration-500 ${
     videoReady && !hasError ? 'opacity-0' : 'opacity-100'
    }`}
    priority={!desktopOnly}
    fetchPriority={desktopOnly ? 'auto' : 'high'}
    loading={desktopOnly ? 'lazy' : undefined}
   />

   {/*
    * VIDEO - Only loads on desktop after hydration
    * Fades in over the image when ready
    */}
   {showVideo && !hasError && (
    <video
     ref={videoRef}
     autoPlay
     loop
     muted
     playsInline
     preload="none"
     className={`${className} absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
      videoReady ? 'opacity-100' : 'opacity-0'
     }`}
     style={{
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
     }}
    >
     <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
     <source src={videoSrc} type="video/mp4" />
    </video>
   )}
  </div>
 )
}

OptimizedVideoHero.displayName = 'OptimizedVideoHero'
