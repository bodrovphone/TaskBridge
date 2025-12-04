import { type SupportedLocale } from '@/lib/constants/locales'

interface FlagIconProps {
  locale: SupportedLocale
  className?: string
  size?: number
}

/**
 * Inline SVG flag icons that work consistently across all platforms
 * Replaces emoji flags which don't render properly on Windows
 */
export function FlagIcon({ locale, className = '', size = 20 }: FlagIconProps) {
  const height = Math.round(size * 0.7) // Standard flag aspect ratio ~1.4:1

  const flags: Record<SupportedLocale, React.ReactNode> = {
    bg: (
      // Bulgaria: White, Green, Red horizontal stripes
      <svg width={size} height={height} viewBox="0 0 20 14" className={className}>
        <rect width="20" height="4.67" fill="#FFFFFF" />
        <rect y="4.67" width="20" height="4.67" fill="#00966E" />
        <rect y="9.33" width="20" height="4.67" fill="#D62612" />
      </svg>
    ),
    ua: (
      // Ukraine: Blue and Yellow horizontal stripes
      <svg width={size} height={height} viewBox="0 0 20 14" className={className}>
        <rect width="20" height="7" fill="#005BBB" />
        <rect y="7" width="20" height="7" fill="#FFD500" />
      </svg>
    ),
    en: (
      // United Kingdom: Union Jack
      <svg width={size} height={height} viewBox="0 0 60 42" className={className}>
        <rect width="60" height="42" fill="#012169" />
        <path d="M0,0 L60,42 M60,0 L0,42" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M0,0 L60,42 M60,0 L0,42" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 V42 M0,21 H60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 V42 M0,21 H60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    ),
    ru: (
      // Russia: White, Blue, Red horizontal stripes
      <svg width={size} height={height} viewBox="0 0 20 14" className={className}>
        <rect width="20" height="4.67" fill="#FFFFFF" />
        <rect y="4.67" width="20" height="4.67" fill="#0039A6" />
        <rect y="9.33" width="20" height="4.67" fill="#D52B1E" />
      </svg>
    ),
  }

  return flags[locale] || null
}
