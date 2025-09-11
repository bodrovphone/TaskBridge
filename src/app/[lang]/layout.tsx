import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { LocaleProviders } from './providers'
import { Header, Footer } from '@/components/common'
import { SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { validateLocale } from '@/lib/utils/locale-detection'

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ lang: locale }))
}

/**
 * Locale-specific layout that validates the locale and provides proper context
 * @param children - Child components
 * @param params - Route parameters including locale
 */
async function LocaleLayout({ 
  children, 
  params 
}: LocaleLayoutProps) {
  const { lang } = await params
  
  // Validate that the locale is supported using our utility
  const validatedLocale = validateLocale(lang)
  if (!validatedLocale) {
    notFound()
  }

  return (
    <LocaleProviders locale={validatedLocale}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </LocaleProviders>
  )
}

LocaleLayout.displayName = 'LocaleLayout';

export default LocaleLayout;