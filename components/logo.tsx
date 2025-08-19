'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark' | 'gradient'
}

export function Logo({ className, size = 'md', variant = 'gradient' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  }

  const variants = {
    light: 'text-white',
    dark: 'text-slate-900',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
  }

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {/* Logo Icon */}
      <div className={cn(
        sizes[size],
        'relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg'
      )}>
        {/* T for Trudify */}
        <span className={cn(
          'font-bold text-white',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-2xl'
        )}>
          T
        </span>
        
        {/* Accent dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-sm"></div>
      </div>

      {/* Brand Name */}
      <span className={cn(
        'font-bold tracking-tight',
        textSizes[size],
        variants[variant]
      )}>
        Trudify
      </span>
    </div>
  )
}

/**
 * Icon-only version of the logo
 */
export function LogoIcon({ className, size = 'md' }: Omit<LogoProps, 'variant'>) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl', 
    xl: 'w-20 h-20 text-2xl'
  }

  return (
    <div className={cn(
      sizes[size],
      'relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg',
      className
    )}>
      <span className="font-bold text-white">T</span>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-sm"></div>
    </div>
  )
}