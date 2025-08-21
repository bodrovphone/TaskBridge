'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsDesktop } from '@/hooks/use-media-query'

interface VideoBackgroundProps {
  videoSrc: string
  fallbackGradient?: string
  overlayOpacity?: number
  mobileDisabled?: boolean
  children: React.ReactNode
}

export default function VideoBackground({ 
  videoSrc, 
  fallbackGradient = 'from-blue-600 via-blue-700 to-emerald-600',
  overlayOpacity = 0.5,
  mobileDisabled = true,
  children 
}: VideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isDesktop = useIsDesktop()
  
  // Don't load video on mobile if disabled
  const shouldLoadVideo = mobileDisabled ? isDesktop : true

  useEffect(() => {
    if (!shouldLoadVideo) return
    
    // Lazy load video after initial page load
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [shouldLoadVideo])

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
    // Start playing after loaded
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's ok
        console.log('Autoplay blocked by browser')
      })
    }
  }

  const handleVideoError = () => {
    setHasError(true)
    setIsVideoLoaded(false)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Fallback gradient background - always visible initially */}
      <div className={`absolute inset-0 bg-gradient-to-r ${fallbackGradient}`} />
      
      {/* Video background - loads progressively, only on desktop by default */}
      {!hasError && shouldLoadVideo && (
        <AnimatePresence>
          <motion.video
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVideoLoaded ? 1 : 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster="/images/hero-poster.jpg" // Optional: Add a poster image
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
          >
            <source src={videoSrc} type="video/mp4" />
            {/* Can add WebM format for better browser support */}
            {/* <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" /> */}
          </motion.video>
        </AnimatePresence>
      )}
      
      {/* Dark overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: isVideoLoaded ? overlayOpacity : 0.3 }}
      />
      
      {/* Loading indicator - only show if video should load */}
      {shouldLoadVideo && !isVideoLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

VideoBackground.displayName = 'VideoBackground'