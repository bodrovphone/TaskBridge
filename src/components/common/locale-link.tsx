'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ComponentProps } from 'react'
import { extractLocaleFromPathname } from '@/lib/utils/url-locale'
import { DEFAULT_LOCALE } from '@/lib/constants/locales'

interface LocaleLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string
  locale?: string
}

/**
 * Locale-aware Link component that automatically prefixes URLs with current locale
 * @param href - The target URL (without locale prefix)
 * @param locale - Optional locale override
 * @param props - Other Link props
 */
function LocaleLink({ href, locale, ...props }: LocaleLinkProps) {
  const pathname = usePathname()
  
  // Extract current locale from URL or use provided locale
  const currentLocale = locale || extractLocaleFromPathname(pathname) || DEFAULT_LOCALE
  
  // Don't prefix external URLs, API routes, or URLs that already have locale
  const shouldPrefixLocale = (
    !href.startsWith('http') && 
    !href.startsWith('mailto:') &&
    !href.startsWith('tel:') &&
    !href.startsWith('/api/') &&
    !href.startsWith(`/${currentLocale}/`)
  )
  
  const localizedHref = shouldPrefixLocale ? `/${currentLocale}${href}` : href
  
  return <Link href={localizedHref} {...props} />
}

LocaleLink.displayName = 'LocaleLink';

export { LocaleLink };