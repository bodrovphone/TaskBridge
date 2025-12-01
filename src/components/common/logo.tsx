'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LogoProps {
 className?: string
 size?: 'sm' | 'md' | 'lg' | 'xl'
 variant?: 'light' | 'dark' | 'gradient'
}

function Logo({ className, size = 'md', variant = 'gradient' }: LogoProps) {
 const imageSizes = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80
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

 // Choose appropriate SVG size based on display size
 const svgSize = imageSizes[size] <= 32 ? '32' : imageSizes[size] <= 64 ? '64' : '128'

 return (
  <div className={cn('flex items-center space-x-3', className)}>
   {/* Logo Icon */}
   <Image
    src={`/images/logo/trudify-logo-${svgSize}.svg`}
    alt="Trudify"
    width={imageSizes[size]}
    height={imageSizes[size]}
   />

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
function LogoIcon({ className, size = 'md' }: Omit<LogoProps, 'variant'>) {
 const imageSizes = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80
 }

 // Choose appropriate SVG size based on display size
 const svgSize = imageSizes[size] <= 32 ? '32' : imageSizes[size] <= 64 ? '64' : '128'

 return (
  <Image
   src={`/images/logo/trudify-logo-${svgSize}.svg`}
   alt="Trudify"
   width={imageSizes[size]}
   height={imageSizes[size]}
   className={className}
  />
 )
}

Logo.displayName = 'Logo';
LogoIcon.displayName = 'LogoIcon';

export { Logo, LogoIcon };