'use client'

import { cn } from '@/lib/utils'
import { Handshake } from 'lucide-react'

interface LogoProps {
 className?: string
 size?: 'sm' | 'md' | 'lg' | 'xl'
 variant?: 'light' | 'dark' | 'gradient'
}

function Logo({ className, size = 'md', variant = 'gradient' }: LogoProps) {
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

 const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28
 }

 return (
  <div className={cn('flex items-center space-x-3', className)}>
   {/* Logo Icon */}
   <div className={cn(
    sizes[size],
    'relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg'
   )}>
    <Handshake className="text-white" size={iconSizes[size]} />

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
function LogoIcon({ className, size = 'md' }: Omit<LogoProps, 'variant'>) {
 const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
 }

 const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28
 }

 return (
  <div className={cn(
   sizes[size],
   'relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg',
   className
  )}>
   <Handshake className="text-white" size={iconSizes[size]} />
   <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-sm"></div>
  </div>
 )
}

Logo.displayName = 'Logo';
LogoIcon.displayName = 'LogoIcon';

export { Logo, LogoIcon };