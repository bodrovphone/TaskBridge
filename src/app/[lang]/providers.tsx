'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { useState, useEffect } from 'react'
import i18n from '@/lib/i18n'
import { Toaster } from '@/components/ui/toaster'
import { NextUIProvider } from '@nextui-org/react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { type SupportedLocale } from '@/lib/constants/locales'

interface LocaleProvidersProps {
  children: React.ReactNode
  locale: SupportedLocale
}

/**
 * Loading component for i18n initialization
 */
function LocaleLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Query client factory with optimized defaults
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error && 'status' in error && typeof error.status === 'number') {
            return error.status >= 500 && failureCount < 3
          }
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error) => {
          // Don't retry mutations on 4xx errors
          if (error && 'status' in error && typeof error.status === 'number') {
            return error.status >= 500 && failureCount < 1
          }
          return failureCount < 1
        },
      },
    },
  })
}

/**
 * Locale-aware providers with error boundaries and proper initialization
 * @param children - Child components
 * @param locale - Validated locale from URL
 */
function LocaleProviders({ children, locale }: LocaleProvidersProps) {
  const [queryClient] = useState(createQueryClient)
  const [isI18nReady, setIsI18nReady] = useState(false)
  const [i18nError, setI18nError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const initI18n = async () => {
      try {
        // Only change language if different from current
        if (i18n.language !== locale) {
          await i18n.changeLanguage(locale)
        }
        
        if (isMounted) {
          setIsI18nReady(true)
          setI18nError(null)
        }
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        if (isMounted) {
          setI18nError(error instanceof Error ? error : new Error('i18n initialization failed'))
        }
      }
    }

    initI18n()

    return () => {
      isMounted = false
    }
  }, [locale])

  // Handle i18n initialization error
  if (i18nError) {
    return (
      <ErrorBoundary fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Failed to load language resources. Please refresh the page.</p>
        </div>
      }>
        {children}
      </ErrorBoundary>
    )
  }

  // Don't render until i18n is ready with the correct locale
  if (!isI18nReady) {
    return <LocaleLoader />
  }

  return (
    <ErrorBoundary>
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            {children}
            <Toaster />
          </I18nextProvider>
        </QueryClientProvider>
      </NextUIProvider>
    </ErrorBoundary>
  )
}

LocaleLoader.displayName = 'LocaleLoader';
LocaleProviders.displayName = 'LocaleProviders';

export { LocaleProviders };