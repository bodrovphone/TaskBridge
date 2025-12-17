import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { LocaleProviders } from './providers'
import { Header, Footer } from '@/components/common'
import ProgressBar from '@/components/common/progress-bar'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/constants/locales'
import { validateLocale } from '@/lib/utils/locale-detection'
import { generateAlternateLanguages, generateCanonicalUrl } from '@/lib/utils/seo'
import { Toaster } from '@/components/ui/toaster'
import { TelegramConnectionToast } from '@/components/telegram-connection-toast'
import { OrganizationJsonLd, WebSiteJsonLd, LocalBusinessJsonLd } from '@/components/seo/json-ld'
import '../nprogress.css'

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
 * Generate metadata with hrefLang alternates for SEO
 * This tells search engines about all language versions of the page
 */
export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const validatedLocale = validateLocale(lang) as SupportedLocale

  // For layout, we use root path. Child pages will override with their specific paths.
  const pathname = ''

  return {
    alternates: {
      canonical: generateCanonicalUrl(validatedLocale, pathname),
      languages: generateAlternateLanguages(pathname)
    }
  }
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

  // Enable static rendering for this locale
  setRequestLocale(validatedLocale)

  // Get messages for the current locale (server-side)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleProviders locale={validatedLocale}>
        {/* JSON-LD Structured Data for SEO */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />

        <ProgressBar />
        <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
          <Header />
          {/* Spacer for fixed navbar */}
          <div className="h-20" />
          <main className="flex-1 overflow-x-hidden w-full max-w-full">
            {children}
          </main>
          <Footer />
        </div>
        <TelegramConnectionToast />
        <Toaster />
      </LocaleProviders>
    </NextIntlClientProvider>
  )
}

LocaleLayout.displayName = 'LocaleLayout';

export default LocaleLayout;
