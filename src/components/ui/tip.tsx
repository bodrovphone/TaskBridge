'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TipProps {
  /** The element that triggers the tip */
  children: React.ReactNode
  /** Title of the tip */
  title: string
  /** Description/body text of the tip */
  description: string
  /** Text for the dismiss button */
  dismissText?: string
  /** Callback when tip is dismissed */
  onDismiss?: () => void
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  /** Popover side */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Popover alignment */
  align?: 'start' | 'center' | 'end'
  /** Whether the tip is open (controlled) */
  open?: boolean
  /** Callback when open state changes (controlled) */
  onOpenChange?: (open: boolean) => void
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Side offset from trigger */
  sideOffset?: number
  /** Additional className for the content */
  className?: string
}

const variantStyles = {
  primary: {
    bg: 'bg-blue-600',
    arrowFill: '#2563eb',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
    closeHover: 'hover:bg-white/20',
  },
  secondary: {
    bg: 'bg-gray-700',
    arrowFill: '#374151',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
    closeHover: 'hover:bg-white/20',
  },
  success: {
    bg: 'bg-green-600',
    arrowFill: '#16a34a',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
    closeHover: 'hover:bg-white/20',
  },
  warning: {
    bg: 'bg-amber-500',
    arrowFill: '#f59e0b',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
    closeHover: 'hover:bg-white/20',
  },
  info: {
    bg: 'bg-violet-600',
    arrowFill: '#7c3aed',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
    closeHover: 'hover:bg-white/20',
  },
}

export function Tip({
  children,
  title,
  description,
  dismissText = 'Got it',
  onDismiss,
  variant = 'info',
  side = 'bottom',
  align = 'start',
  open,
  onOpenChange,
  defaultOpen,
  sideOffset = 12,
  className,
}: TipProps) {
  const styles = variantStyles[variant]

  const handleDismiss = () => {
    onOpenChange?.(false)
    onDismiss?.()
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'z-50 w-64 rounded-xl shadow-lg outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            styles.bg,
            styles.text,
            className
          )}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={cn(
              'absolute top-2 right-2 p-1 rounded-full transition-colors',
              styles.closeHover
            )}
            aria-label="Close tip"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="p-4 pr-8">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          </div>

          {/* Dismiss button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleDismiss}
              className={cn(
                'w-full py-2 px-4 rounded-full text-sm font-medium transition-colors',
                styles.button
              )}
            >
              {dismissText}
            </button>
          </div>

          {/* Arrow pointing to trigger */}
          <PopoverPrimitive.Arrow
            width={16}
            height={8}
            style={{ fill: styles.arrowFill }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

// Standalone tip content for use without popover (e.g., inline tips)
export interface TipCardProps {
  title: string
  description: string
  dismissText?: string
  onDismiss?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  className?: string
}

export function TipCard({
  title,
  description,
  dismissText = 'Got it',
  onDismiss,
  variant = 'info',
  className,
}: TipCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'relative w-64 rounded-xl shadow-lg',
        styles.bg,
        styles.text,
        className
      )}
    >
      {/* Close button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-full transition-colors',
            styles.closeHover
          )}
          aria-label="Close tip"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Content */}
      <div className="p-4 pr-8">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{description}</p>
      </div>

      {/* Dismiss button */}
      <div className="px-4 pb-4">
        <button
          onClick={onDismiss}
          className={cn(
            'w-full py-2 px-4 rounded-full text-sm font-medium transition-colors',
            styles.button
          )}
        >
          {dismissText}
        </button>
      </div>
    </div>
  )
}
