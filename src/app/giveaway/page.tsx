import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { detectUserLocale } from '@/lib/utils/locale-detection'
import { LOCALE_COOKIE } from '@/lib/constants/locales'

/**
 * Marketing-friendly giveaway URL without locale prefix.
 * Detects user's preferred language and redirects to the localized version.
 *
 * Share this URL: trudify.com/giveaway
 * User will be redirected to: trudify.com/{locale}/giveaway
 */
async function GiveawayRedirectPage() {
  const headersList = await headers()
  const cookieStore = await cookies()

  const cookieValue = cookieStore.get(LOCALE_COOKIE.NAME)?.value
  const acceptLanguage = headersList.get('accept-language')

  const { locale } = detectUserLocale(cookieValue, acceptLanguage)

  redirect(`/${locale}/giveaway`)
}

GiveawayRedirectPage.displayName = 'GiveawayRedirectPage'

export default GiveawayRedirectPage
