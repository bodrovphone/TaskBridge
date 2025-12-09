'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { OnboardingCard } from './OnboardingCard'
import { Z_INDEX } from '@/lib/constants/z-index'

interface TourOverlayProps {
  isVisible: boolean
  selector: string
  icon?: string
  title: string
  content: string
  side: 'top' | 'bottom' | 'left' | 'right'
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onStop: () => void
}

interface Position {
  top: number
  left: number
  width: number
  height: number
}

export function TourOverlay({
  isVisible,
  selector,
  icon,
  title,
  content,
  side,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onStop,
}: TourOverlayProps) {
  const [targetPosition, setTargetPosition] = useState<Position | null>(null)
  const [cardPosition, setCardPosition] = useState<{ top: number; left: number } | null>(null)
  const [isCardReady, setIsCardReady] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset card ready state when selector changes
  useEffect(() => {
    setIsCardReady(false)
    setCardPosition(null)
  }, [selector])

  // Find and track target element position
  useEffect(() => {
    if (!isVisible || !selector) {
      setTargetPosition(null)
      return
    }

    const updatePosition = () => {
      const element = document.querySelector(selector)
      if (element) {
        const rect = element.getBoundingClientRect()
        const padding = 8 // Padding around the element
        setTargetPosition({
          top: rect.top - padding + window.scrollY,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        })

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setTargetPosition(null)
      }
    }

    // Initial position
    updatePosition()

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    // Also check periodically in case DOM updates
    const interval = setInterval(updatePosition, 500)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [isVisible, selector])

  // Calculate card position based on target and side
  useEffect(() => {
    if (!targetPosition || !cardRef.current) {
      return
    }

    // Small delay to ensure card is rendered and has dimensions
    const timer = setTimeout(() => {
      if (!cardRef.current) return

      const cardRect = cardRef.current.getBoundingClientRect()
      const gap = 16 // Gap between target and card
      const viewportPadding = 16 // Padding from viewport edges

      let top = 0
      let left = 0

      switch (side) {
        case 'bottom':
          top = targetPosition.top + targetPosition.height + gap - window.scrollY
          left = targetPosition.left + targetPosition.width / 2 - cardRect.width / 2
          break
        case 'top':
          top = targetPosition.top - cardRect.height - gap - window.scrollY
          left = targetPosition.left + targetPosition.width / 2 - cardRect.width / 2
          break
        case 'left':
          // Position card below the target so target remains visible
          top = targetPosition.top + targetPosition.height + gap - window.scrollY
          left = targetPosition.left - cardRect.width / 2
          break
        case 'right':
          // Position card below the target so target remains visible
          top = targetPosition.top + targetPosition.height + gap - window.scrollY
          left = targetPosition.left + targetPosition.width - cardRect.width / 2
          break
      }

      // Keep card within viewport
      const maxLeft = window.innerWidth - cardRect.width - viewportPadding
      const maxTop = window.innerHeight - cardRect.height - viewportPadding

      left = Math.max(viewportPadding, Math.min(left, maxLeft))
      top = Math.max(viewportPadding, Math.min(top, maxTop))

      setCardPosition({ top, left })
      setIsCardReady(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [targetPosition, side])

  if (!mounted || !isVisible) return null

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay with spotlight hole */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0"
            style={{
              zIndex: Z_INDEX.TOUR_OVERLAY,
              background: targetPosition
                ? `radial-gradient(
                    ellipse ${targetPosition.width + 20}px ${targetPosition.height + 20}px at
                    ${targetPosition.left + targetPosition.width / 2}px
                    ${targetPosition.top + targetPosition.height / 2 - window.scrollY}px,
                    transparent 0%,
                    transparent 70%,
                    rgba(0, 0, 0, 0.75) 100%
                  )`
                : 'rgba(0, 0, 0, 0.75)',
            }}
            onClick={onStop}
          />

          {/* Spotlight border around target */}
          {targetPosition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed rounded-lg ring-4 ring-primary ring-opacity-50 pointer-events-none"
              style={{
                zIndex: Z_INDEX.TOUR_SPOTLIGHT,
                top: targetPosition.top - window.scrollY,
                left: targetPosition.left,
                width: targetPosition.width,
                height: targetPosition.height,
              }}
            />
          )}

          {/* Card - render offscreen first to measure, then animate in when positioned */}
          <div
            ref={cardRef}
            className="fixed"
            style={{
              zIndex: Z_INDEX.TOUR_CARD,
              // Position offscreen until ready, then at calculated position
              top: isCardReady ? cardPosition?.top : -9999,
              left: isCardReady ? cardPosition?.left : -9999,
              opacity: isCardReady ? 1 : 0,
              transform: isCardReady ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
            }}
          >
            <OnboardingCard
              icon={icon}
              title={title}
              content={content}
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={onNext}
              onPrev={onPrev}
              onStop={onStop}
            />
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
