/**
 * Default Task Image Component
 * Displays gradient background with category icon for tasks without photos
 */

'use client'

import { getCategoryVisual } from '@/lib/constants/category-visuals'

interface DefaultTaskImageProps {
  category: string
  className?: string
}

export default function DefaultTaskImage({ category, className = '' }: DefaultTaskImageProps) {
  const visual = getCategoryVisual(category)
  const Icon = visual.icon

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient} ${className}`}>
      {/* Subtle diagonal pattern overlay for texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
        }}
      />

      {/* Large icon in center - subtle and elegant */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-24 h-24 text-white opacity-20" strokeWidth={1.5} />
      </div>
    </div>
  )
}
