'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { NextUIProvider } from '@nextui-org/react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { type SupportedLocale } from '@/lib/constants/locales'
import { AuthProvider } from '@/features/auth'

interface LocaleProvidersProps {
  children: React.ReactNode
  locale: SupportedLocale
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
 * Locale-aware providers with error boundaries
 * Note: i18n is now handled by NextIntlClientProvider in layout.tsx
 * @param children - Child components
 * @param locale - Validated locale from URL (kept for potential future use)
 */
function LocaleProviders({ children, locale }: LocaleProvidersProps) {
  const [queryClient] = useState(createQueryClient)

  // locale is available for any locale-specific logic that doesn't use translations
  void locale

  return (
    <ErrorBoundary>
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </NextUIProvider>
    </ErrorBoundary>
  )
}

LocaleProviders.displayName = 'LocaleProviders';

export { LocaleProviders };
