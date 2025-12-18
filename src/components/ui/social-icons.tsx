'use client'

import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa'
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

// Official LinkedIn Icon
export function LinkedInIcon({ className, size = 24 }: SocialIconProps) {
  return (
    <FaLinkedinIn
      size={size}
      className={cn('text-current', className)}
    />
  )
}

// Official YouTube Icon
export function YouTubeIcon({ className, size = 24 }: SocialIconProps) {
  return (
    <FaYoutube
      size={size}
      className={cn('text-current', className)}
    />
  )
}

interface SocialLinksProps {
  instagramUrl?: string
  facebookUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  className?: string
  iconSize?: number
  variant?: 'default' | 'footer' | 'colored'
}

// Reusable Social Links Component
export function SocialLinks({
  instagramUrl = 'https://www.instagram.com/trudify_com',
  facebookUrl = 'https://www.facebook.com/profile.php?id=61584366488168',
  linkedinUrl = 'https://www.linkedin.com/company/trudify',
  youtubeUrl = 'https://www.youtube.com/@Trudify_com',
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
      linkedin: '',
      youtube: '',
    },
    footer: {
      container: 'p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white',
      instagram: 'hover:text-pink-400',
      facebook: 'hover:text-blue-400',
      linkedin: 'hover:text-blue-500',
      youtube: 'hover:text-red-500',
    },
    colored: {
      container: 'p-2.5 rounded-full transition-transform hover:scale-110',
      instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white',
      facebook: 'bg-blue-600 text-white hover:bg-blue-700',
      linkedin: 'bg-[#0A66C2] text-white hover:bg-[#004182]',
      youtube: 'bg-red-600 text-white hover:bg-red-700',
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
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on LinkedIn"
          className={cn(baseStyles, styles.container, styles.linkedin)}
        >
          <LinkedInIcon size={iconSize} />
        </a>
      )}
      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Subscribe on YouTube"
          className={cn(baseStyles, styles.container, styles.youtube)}
        >
          <YouTubeIcon size={iconSize} />
        </a>
      )}
    </div>
  )
}

export default SocialLinks
