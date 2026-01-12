'use client'

import { Avatar } from '@heroui/react'
import { Star } from 'lucide-react'

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  location?: string
  avatarUrl?: string
  rating?: number
}

export function TestimonialCard({
  quote,
  name,
  role,
  location,
  avatarUrl,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      {/* Rating stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        <Avatar
          src={avatarUrl}
          name={name}
          size="lg"
          classNames={{
            base: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            name: 'text-white font-semibold',
          }}
        />
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">
            {role}
            {location && ` • ${location}`}
          </div>
        </div>
      </div>
    </div>
  )
}
