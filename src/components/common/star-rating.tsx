'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  /**
   * Current rating value (1-5)
   */
  value?: number
  /**
   * Callback when rating changes (interactive mode only)
   */
  onChange?: (rating: number) => void
  /**
   * Interactive mode allows clicking to change rating
   * Display-only mode just shows the rating
   */
  interactive?: boolean
  /**
   * Size of the stars
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Show rating number next to stars
   */
  showValue?: boolean
  /**
   * Custom class name
   */
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export function StarRating({
  value = 0,
  onChange,
  interactive = false,
  size = 'md',
  showValue = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!interactive) return

    const rating = index + 1
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(rating)
    } else if (event.key === 'ArrowRight' && rating < 5) {
      event.preventDefault()
      handleClick(rating + 1)
    } else if (event.key === 'ArrowLeft' && rating > 1) {
      event.preventDefault()
      handleClick(rating - 1)
    }
  }

  const displayRating = interactive ? (hoverRating || value) : value

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex gap-1"
        onMouseLeave={() => interactive && setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onKeyDown={(e) => handleKeyDown(e, star - 1)}
              disabled={!interactive}
              className={`
                ${sizeClasses[size]}
                transition-all duration-150
                ${
                  interactive
                    ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded'
                    : 'cursor-default'
                }
              `}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              tabIndex={interactive ? 0 : -1}
            >
              <Star
                className={`
                  ${sizeClasses[size]}
                  transition-colors duration-150
                  ${
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-gray-300'
                  }
                  ${
                    interactive && hoverRating >= star
                      ? 'fill-yellow-300 text-yellow-300'
                      : ''
                  }
                `}
              />
            </button>
          )
        })}
      </div>
      {showValue && value > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
