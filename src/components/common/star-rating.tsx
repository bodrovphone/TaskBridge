'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  /** Current rating value (0-5) */
  value: number
  /** Whether the rating is interactive (clickable) */
  interactive?: boolean
  /** Callback when rating changes (only for interactive mode) */
  onChange?: (rating: number) => void
  /** Size of the stars */
  size?: 'sm' | 'md' | 'lg'
  /** Show the numeric rating next to stars */
  showValue?: boolean
  /** Custom className for the container */
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

export function StarRating({
  value,
  interactive = false,
  onChange,
  size = 'md',
  showValue = false,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleClick = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!interactive) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(index + 1)
    } else if (event.key === 'ArrowRight' && index < 4) {
      // Focus next star
      const nextButton = event.currentTarget.nextElementSibling as HTMLButtonElement
      nextButton?.focus()
    } else if (event.key === 'ArrowLeft' && index > 0) {
      // Focus previous star
      const prevButton = event.currentTarget.previousElementSibling as HTMLButtonElement
      prevButton?.focus()
    }
  }

  const displayRating = hoverRating ?? value
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {stars.map((star, index) => {
          const isFilled = star <= displayRating

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded',
                  'hover:scale-110 active:scale-95',
                  isFilled ? 'text-warning' : 'text-gray-300'
                )}
                aria-label={`Rate ${star} out of 5 stars`}
                tabIndex={0}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    isFilled && 'fill-current'
                  )}
                />
              </button>
            )
          }

          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                isFilled ? 'text-warning fill-warning' : 'text-gray-300'
              )}
            />
          )
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
