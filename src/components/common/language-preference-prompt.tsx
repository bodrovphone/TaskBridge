'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth'
import { saveUserLocalePreference } from '@/lib/utils/client-locale'
import { replaceLocaleInPathname } from '@/lib/utils/url-locale'
import { Tip } from '@/components/ui/tip'
import type { SupportedLocale } from '@/lib/constants/locales'
import type { PreferredLanguage } from '@/server/domain/user/user.types'

// Session storage key - only persists for the browser session
const LANGUAGE_PROMPT_DISMISSED_KEY = 'trudify_language_prompt_dismissed'
// Flag to coordinate with other dialogs (e.g., professional onboarding)
const LANGUAGE_PROMPT_ACTIVE_KEY = 'trudify_language_prompt_active'

// Language names in their OWN language (native names)
const NATIVE_LANGUAGE_NAMES: Record<PreferredLanguage, string> = {
  en: 'English',
  bg: 'български',
  ru: 'русский',
  ua: 'українська',
}

// Language prompt translations in each language (shown in user's PREFERRED language)
const LANGUAGE_PROMPT_TRANSLATIONS: Record<PreferredLanguage, { title: string; switch: string }> = {
  en: { title: 'Switch to {language}?', switch: 'Yes, switch' },
  bg: { title: 'Превключи на {language}?', switch: 'Да, превключи' },
  ru: { title: 'Переключить на {language}?', switch: 'Да, переключить' },
  ua: { title: 'Переключити на {language}?', switch: 'Так, переключити' },
}

interface LanguagePreferencePromptProps {
  children: React.ReactNode
}

/**
 * LanguagePreferencePrompt Component
 *
 * Wraps the LanguageSwitcher and shows a tip pointing to it when:
 * - User is authenticated
 * - User's preferred language differs from current URL locale
 * - User hasn't dismissed the prompt in this session
 *
 * One-time prompt per session, persisted in sessionStorage.
 *
 * Testing: Add ?showLangPrompt=1 to URL to force show the prompt
 */
export function LanguagePreferencePrompt({ children }: LanguagePreferencePromptProps) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useAuth()

  const [showTip, setShowTip] = useState(false)
  const [forceShow, setForceShow] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  const currentLocale = (params?.lang as SupportedLocale) || 'bg'
  const preferredLanguage = profile?.preferredLanguage as PreferredLanguage | undefined

  // Check for force-show param (for testing) - client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      setForceShow(searchParams.get('showLangPrompt') === '1')
    }
  }, [])

  // Check if this element is visible (not hidden by CSS)
  const isVisible = useCallback(() => {
    if (!wrapperRef.current) return false
    const rect = wrapperRef.current.getBoundingClientRect()
    // Element is visible if it has dimensions and is in viewport
    return rect.width > 0 && rect.height > 0
  }, [])

  // Check if we should show the tip
  useEffect(() => {
    const shouldShow = () => {
      // Must be visible on screen (checks getBoundingClientRect)
      if (!isVisible()) return false

      // Force show for testing
      if (forceShow) return true

      // Wait for auth to load
      if (loading) return false

      // Must be authenticated with a profile
      if (!profile) return false

      // Must have a preferred language set
      if (!preferredLanguage) return false

      // Check if languages differ
      if (currentLocale === preferredLanguage) return false

      // Check if already dismissed this session
      const dismissed = sessionStorage.getItem(LANGUAGE_PROMPT_DISMISSED_KEY)
      if (dismissed === profile.id) return false

      return true
    }

    // Use requestAnimationFrame to ensure DOM is ready before checking visibility
    let animationFrameId: number
    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(() => {
        if (shouldShow()) {
          // Set active flag so other dialogs (professional onboarding) know to wait
          sessionStorage.setItem(LANGUAGE_PROMPT_ACTIVE_KEY, 'true')
          setShowTip(true)
        }
      })
    }, forceShow ? 500 : 800)

    return () => {
      clearTimeout(timer)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [forceShow, loading, profile, preferredLanguage, currentLocale, isVisible])

  // Handle switching to preferred language
  const handleSwitch = useCallback(() => {
    if (!preferredLanguage || !profile?.id) return

    // Mark as dismissed for this session
    sessionStorage.setItem(LANGUAGE_PROMPT_DISMISSED_KEY, profile.id)
    // Clear active flag so other dialogs can show
    sessionStorage.removeItem(LANGUAGE_PROMPT_ACTIVE_KEY)
    setShowTip(false)

    // Save preference to cookie/localStorage
    saveUserLocalePreference(preferredLanguage)

    // Navigate to new locale URL (next-intl handles locale via URL)
    const newPath = replaceLocaleInPathname(pathname, preferredLanguage)
    router.push(newPath)
  }, [preferredLanguage, profile?.id, pathname, router])

  // Handle dismiss (clicking outside or X)
  const handleDismiss = useCallback(() => {
    if (profile?.id) {
      sessionStorage.setItem(LANGUAGE_PROMPT_DISMISSED_KEY, profile.id)
    }
    // Clear active flag so other dialogs can show
    sessionStorage.removeItem(LANGUAGE_PROMPT_ACTIVE_KEY)
    setShowTip(false)
  }, [profile?.id])

  // Get the native language name (e.g., "русский" for Russian)
  const nativeLanguageName = preferredLanguage
    ? NATIVE_LANGUAGE_NAMES[preferredLanguage]
    : ''

  // Get translations in the user's PREFERRED language (not current URL locale)
  // This ensures the prompt is shown in a language the user understands
  const promptTranslations = preferredLanguage
    ? LANGUAGE_PROMPT_TRANSLATIONS[preferredLanguage]
    : LANGUAGE_PROMPT_TRANSLATIONS.en

  const promptTitle = promptTranslations.title.replace('{language}', nativeLanguageName)
  const promptSwitch = promptTranslations.switch

  return (
    <Tip
      open={showTip}
      onOpenChange={(open) => !open && handleDismiss()}
      onDismiss={handleDismiss}
      onAction={handleSwitch}
      title={promptTitle}
      description=""
      dismissText={promptSwitch}
      variant="primary"
      side="bottom"
      align="center"
    >
      <span ref={wrapperRef} className="inline-flex" role="button" tabIndex={0}>{children}</span>
    </Tip>
  )
}
