'use client'

import { ReactNode } from 'react'

interface ContentSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'gray' | 'gradient'
  id?: string
}

export function ContentSection({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  id,
}: ContentSectionProps) {
  const bgClasses = {
    default: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  }

  return (
    <section id={id} className={`py-16 md:py-20 ${bgClasses[variant]} ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
