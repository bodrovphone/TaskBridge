'use client'

import { cn } from '@/lib/utils'

interface SpinningGeometricProps {
 className?: string
 size?: 'sm' | 'md' | 'lg' | 'xl'
 opacity?: number
 colors?: {
  primary: string
  secondary: string
 }
}

interface WobblingGeometricProps {
 className?: string
 size?: 'sm' | 'md' | 'lg' | 'xl'
 opacity?: number
 colors?: {
  primary: string
  accent?: string
 }
}

/**
 * Reusable spinning geometric element with accent dot
 * Features a slow rotating square with a pinging accent dot
 */
function SpinningGeometric({ 
 className, 
 size = 'md', 
 opacity = 0.3,
 colors = {
  primary: 'from-blue-400 to-cyan-400',
  secondary: 'from-cyan-400 to-teal-400'
 }
}: SpinningGeometricProps) {
 const sizes = {
  sm: { main: 'w-12 h-12', accent: 'w-4 h-4' },
  md: { main: 'w-16 h-16', accent: 'w-8 h-8' },
  lg: { main: 'w-20 h-20', accent: 'w-10 h-10' },
  xl: { main: 'w-24 h-24', accent: 'w-12 h-12' }
 }

 return (
  <div className={cn('relative', className)} style={{ opacity }}>
   <div className="relative">
    <div className={cn(
     sizes[size].main,
     `bg-gradient-to-r ${colors.primary} rounded-2xl rotate-12 animate-spin-slow`
    )}></div>
    <div className={cn(
     'absolute -top-2 -right-2',
     sizes[size].accent,
     `bg-gradient-to-r ${colors.secondary} rounded-lg rotate-45 animate-ping`
    )}></div>
   </div>
  </div>
 )
}

/**
 * Reusable wobbling geometric element with accent dot
 * Features a wobbling rectangle with scale variations and a pinging accent
 */
function WobblingGeometric({ 
 className, 
 size = 'md', 
 opacity = 0.3,
 colors = {
  primary: 'from-violet-400 to-purple-400',
  accent: 'bg-white'
 }
}: WobblingGeometricProps) {
 const sizes = {
  sm: { main: 'w-16 h-16', accent: 'w-3 h-3' },
  md: { main: 'w-20 h-20', accent: 'w-4 h-4' },
  lg: { main: 'w-24 h-24', accent: 'w-5 h-5' },
  xl: { main: 'w-28 h-28', accent: 'w-6 h-6' }
 }

 return (
  <div className={cn('relative', className)} style={{ opacity }}>
   <div className="relative">
    <div className={cn(
     sizes[size].main,
     `bg-gradient-to-r ${colors.primary} rounded-3xl -rotate-12 animate-wobble`
    )}></div>
    <div className={cn(
     'absolute top-1 right-1',
     sizes[size].accent,
     `${colors.accent} rounded-full animate-ping`
    )}></div>
   </div>
  </div>
 )
}

/**
 * Animation definitions - include this in your global CSS or component
 */
export const geometricAnimationStyles = `
 @keyframes spin-slow {
  from { transform: rotate(12deg); }
  to { transform: rotate(372deg); }
 }
 
 @keyframes wobble {
  0%, 100% { transform: rotate(-12deg) scale(1); }
  25% { transform: rotate(-15deg) scale(1.05); }
  75% { transform: rotate(-9deg) scale(0.95); }
 }
 
 .animate-spin-slow {
  animation: spin-slow 8s linear infinite;
 }
 
 .animate-wobble {
  animation: wobble 4s ease-in-out infinite;
 }
`

SpinningGeometric.displayName = 'SpinningGeometric';
WobblingGeometric.displayName = 'WobblingGeometric';

export { SpinningGeometric, WobblingGeometric };