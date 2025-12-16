'use client'

import { FaInstagram, FaFacebookF } from 'react-icons/fa'
import { cn } from '@/lib/utils'

interface SocialIconProps {
  className?: string
  size?: number
}

// Official Instagram Icon with gradient background
export function InstagramIcon({ className, size = 24 }: SocialIconProps) {
  return (
    <FaInstagram
      size={size}
      className={cn('text-current', className)}
    />
  )
}

// Official Facebook Icon
export function FacebookIcon({ className, size = 24 }: SocialIconProps) {
  return (
    <FaFacebookF
      size={size}
      className={cn('text-current', className)}
    />
  )
}

interface SocialLinksProps {
  instagramUrl?: string
  facebookUrl?: string
  className?: string
  iconSize?: number
  variant?: 'default' | 'footer' | 'colored'
}

// Reusable Social Links Component
export function SocialLinks({
  instagramUrl = 'https://www.instagram.com/trudify_com',
  facebookUrl = 'https://www.facebook.com/profile.php?id=61584366488168',
  className,
  iconSize = 20,
  variant = 'default',
}: SocialLinksProps) {
  const baseStyles = 'flex items-center justify-center transition-all duration-200'

  const variantStyles = {
    default: {
      container: 'p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900',
      instagram: '',
      facebook: '',
    },
    footer: {
      container: 'p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white',
      instagram: 'hover:text-pink-400',
      facebook: 'hover:text-blue-400',
    },
    colored: {
      container: 'p-2.5 rounded-full transition-transform hover:scale-110',
      instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white',
      facebook: 'bg-blue-600 text-white hover:bg-blue-700',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
          className={cn(baseStyles, styles.container, styles.instagram)}
        >
          <InstagramIcon size={iconSize} />
        </a>
      )}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Facebook"
          className={cn(baseStyles, styles.container, styles.facebook)}
        >
          <FacebookIcon size={iconSize} />
        </a>
      )}
    </div>
  )
}

export default SocialLinks
