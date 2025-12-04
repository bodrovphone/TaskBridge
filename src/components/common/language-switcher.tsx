'use client'

import { useTranslation } from 'react-i18next'
import { useRouter, usePathname } from 'next/navigation'
import {
 Dropdown,
 DropdownTrigger,
 DropdownMenu,
 DropdownItem,
 Button
} from '@nextui-org/react'
import { LANGUAGE_CONFIG, type SupportedLocale } from '@/lib/constants/locales'
import { FlagIcon } from '@/components/ui/flag-icon'
import { extractLocaleFromPathname, replaceLocaleInPathname } from '@/lib/utils/url-locale'
import { saveUserLocalePreference } from '@/lib/utils/client-locale'
import { updateUserLanguagePreference } from '@/lib/utils/update-user-language'
import { useAuth } from '@/features/auth'

interface LanguageSwitcherProps {
 /**
  * Display mode for the switcher
  * - 'icon': Shows only the flag icon (default, for header)
  * - 'full': Shows language name with flag on the right (for mobile menu)
  */
 mode?: 'icon' | 'full'
}

/**
 * Language switcher component with proper locale management
 * Handles both URL navigation and persistence of user preferences
 */
function LanguageSwitcher({ mode = 'icon' }: LanguageSwitcherProps) {
 const { i18n } = useTranslation()
 const router = useRouter()
 const pathname = usePathname()
 const { authenticatedFetch } = useAuth()

 // Extract current locale from URL with fallback
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'bg'
 const currentLanguage = LANGUAGE_CONFIG[currentLocale]

 /**
  * Handles language change with proper persistence and navigation
  * @param key - Selected language code
  */
 const handleLanguageChange = async (key: unknown) => {
  const newLocale = key as SupportedLocale

  if (!LANGUAGE_CONFIG[newLocale]) {
   console.warn(`Unsupported locale selected: ${newLocale}`)
   return
  }

  try {
   // Save user preference for future visits (cookie + localStorage)
   saveUserLocalePreference(newLocale)

   // Update authenticated user's profile language preference (silently fails if not logged in)
   await updateUserLanguagePreference(newLocale, authenticatedFetch)

   // Update i18next for immediate UI feedback
   i18n.changeLanguage(newLocale)

   // Navigate to new locale URL
   const newPath = replaceLocaleInPathname(pathname, newLocale)
   router.push(newPath)
  } catch (error) {
   console.error('Failed to change language:', error)
  }
 }

 return (
  <Dropdown>
   <DropdownTrigger>
    {mode === 'icon' ? (
     <Button
      variant="light"
      size="sm"
      className="h-8 px-2 min-w-[32px] flex-shrink-0"
      isIconOnly
     >
      <FlagIcon locale={currentLocale} size={22} />
     </Button>
    ) : (
     <Button
      variant="light"
      size="lg"
      className="w-full justify-between px-0 font-medium text-gray-900"
      endContent={<FlagIcon locale={currentLocale} size={22} />}
     >
      {currentLanguage.name}
     </Button>
    )}
   </DropdownTrigger>
   <DropdownMenu 
    aria-label="Language selection"
    onAction={handleLanguageChange}
    selectedKeys={new Set([currentLocale])}
    selectionMode="single"
   >
    {Object.values(LANGUAGE_CONFIG).map((language) => (
     <DropdownItem
      key={language.code}
      startContent={<FlagIcon locale={language.code} size={20} />}
     >
      {language.name}
     </DropdownItem>
    ))}
   </DropdownMenu>
  </Dropdown>
 );
}

LanguageSwitcher.displayName = 'LanguageSwitcher';

export { LanguageSwitcher };