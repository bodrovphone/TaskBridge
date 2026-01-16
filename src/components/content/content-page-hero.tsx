import { ReactNode } from 'react'

interface ContentPageHeroProps {
  title: string
  subtitle?: string
  children?: ReactNode
  className?: string
}

export function ContentPageHero({ title, subtitle, children, className = '' }: ContentPageHeroProps) {
  return (
    <section className={`py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
