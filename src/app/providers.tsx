'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '@react-aria/i18n'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { HeroUIProvider } from '@heroui/react'
import { AuthProvider } from '@/features/auth'

function Providers({ children }: { children: React.ReactNode }) {
 const [queryClient] = useState(
  () =>
   new QueryClient({
    defaultOptions: {
     queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
     },
    },
   })
 )

 return (
  <HeroUIProvider>
   <QueryClientProvider client={queryClient}>
    <I18nProvider locale="en-GB">
     <AuthProvider>
      {children}
      <Toaster />
     </AuthProvider>
    </I18nProvider>
   </QueryClientProvider>
  </HeroUIProvider>
 )
}

Providers.displayName = 'Providers';

export { Providers };