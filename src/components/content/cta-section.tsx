'use client'

import { Button } from '@nextui-org/react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CTASectionProps {
  title: string
  subtitle?: string
  primaryButton: {
    text: string
    href: string
  }
  secondaryButton?: {
    text: string
    href: string
  }
  variant?: 'default' | 'gradient'
}

export function CTASection({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  variant = 'gradient',
}: CTASectionProps) {
  const bgClass =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
      : 'bg-gray-50 text-gray-900'

  return (
    <section className={`py-16 md:py-20 ${bgClass}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className={`text-lg md:text-xl mb-8 ${variant === 'gradient' ? 'text-blue-100' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            href={primaryButton.href}
            size="lg"
            className={
              variant === 'gradient'
                ? 'bg-white text-blue-600 font-semibold hover:bg-blue-50'
                : 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
            }
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            {primaryButton.text}
          </Button>
          {secondaryButton && (
            <Button
              as={Link}
              href={secondaryButton.href}
              size="lg"
              variant="bordered"
              className={
                variant === 'gradient'
                  ? 'border-white text-white hover:bg-white/10'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }
            >
              {secondaryButton.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
