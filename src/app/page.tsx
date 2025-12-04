import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { detectUserLocale } from '@/lib/utils/locale-detection'
import { LOCALE_COOKIE } from '@/lib/constants/locales'

// This page should never be reached due to middleware redirects,
// but provides a fallback with proper locale detection just in case
async function RootPage() {
  const headersList = await headers()
  const cookieStore = await cookies()

  // Use the same locale detection logic as middleware
  const cookieValue = cookieStore.get(LOCALE_COOKIE.NAME)?.value
  const acceptLanguage = headersList.get('accept-language')

  const { locale } = detectUserLocale(cookieValue, acceptLanguage)

  redirect(`/${locale}`)
}

RootPage.displayName = 'RootPage';

export default RootPage;