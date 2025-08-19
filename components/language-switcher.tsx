'use client'

import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from '@nextui-org/react'
import { LANGUAGE_CONFIG, type SupportedLocale } from '@/lib/constants/locales'
import { extractLocaleFromPathname, replaceLocaleInPathname } from '@/lib/utils/url-locale'
import { saveUserLocalePreference } from '@/lib/utils/client-locale'

/**
 * Language switcher component with proper locale management
 * Handles both URL navigation and persistence of user preferences
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()

  // Extract current locale from URL with fallback
  const currentLocale = extractLocaleFromPathname(pathname) ?? 'en'
  const currentLanguage = LANGUAGE_CONFIG[currentLocale]

  /**
   * Handles language change with proper persistence and navigation
   * @param key - Selected language code
   */
  const handleLanguageChange = (key: unknown) => {
    const newLocale = key as SupportedLocale
    
    if (!LANGUAGE_CONFIG[newLocale]) {
      console.warn(`Unsupported locale selected: ${newLocale}`)
      return
    }
    
    try {
      // Save user preference for future visits
      saveUserLocalePreference(newLocale)
      
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
        <Button 
          variant="light" 
          size="sm"
          startContent={<Globe size={16} />}
          className="h-8 px-2 gap-1"
        >
          <span>{currentLanguage.flag}</span>
          <span className="text-sm">{currentLanguage.name}</span>
        </Button>
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
            startContent={<span className="text-lg">{language.flag}</span>}
          >
            {language.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}