'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth'
import { saveUserLocalePreference } from '@/lib/utils/client-locale'
import { replaceLocaleInPathname } from '@/lib/utils/url-locale'
import { Tip } from '@/components/ui/tip'
import type { SupportedLocale } from '@/lib/constants/locales'
import type { PreferredLanguage } from '@/server/domain/user/user.types'

// Session storage key - only persists for the browser session
const LANGUAGE_PROMPT_DISMISSED_KEY = 'trudify_language_prompt_dismissed'

// Language names in their OWN language (native names)
const NATIVE_LANGUAGE_NAMES: Record<PreferredLanguage, string> = {
  en: 'English',
  bg: 'български',
  ru: 'русский',
  ua: 'українська',
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
  const { t, i18n } = useTranslation()
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile, loading } = useAuth()

  const [showTip, setShowTip] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  const currentLocale = (params?.lang as SupportedLocale) || 'bg'
  const preferredLanguage = profile?.preferredLanguage as PreferredLanguage | undefined

  // Check for force-show param (for testing)
  const forceShow = searchParams.get('showLangPrompt') === '1'

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
    setShowTip(false)

    // Save preference to cookie/localStorage
    saveUserLocalePreference(preferredLanguage)

    // Update i18next
    i18n.changeLanguage(preferredLanguage)

    // Navigate to new locale URL
    const newPath = replaceLocaleInPathname(pathname, preferredLanguage)
    router.push(newPath)
  }, [preferredLanguage, profile?.id, pathname, router, i18n])

  // Handle dismiss (clicking outside or X)
  const handleDismiss = useCallback(() => {
    if (profile?.id) {
      sessionStorage.setItem(LANGUAGE_PROMPT_DISMISSED_KEY, profile.id)
    }
    setShowTip(false)
  }, [profile?.id])

  // Get the native language name (e.g., "русский" for Russian)
  const nativeLanguageName = preferredLanguage
    ? NATIVE_LANGUAGE_NAMES[preferredLanguage]
    : ''

  // Get translations in the user's PREFERRED language (not current URL locale)
  // This way the popup speaks to the user in their preferred language
  const preferredT = useMemo(() => {
    if (!preferredLanguage) return t
    return i18n.getFixedT(preferredLanguage)
  }, [preferredLanguage, i18n, t])

  return (
    <Tip
      open={showTip}
      onOpenChange={(open) => !open && handleDismiss()}
      onDismiss={handleDismiss}
      onAction={handleSwitch}
      title={preferredT('languagePrompt.title', { language: nativeLanguageName })}
      description=""
      dismissText={preferredT('languagePrompt.switch')}
      variant="primary"
      side="bottom"
      align="center"
    >
      <span ref={wrapperRef} className="inline-flex">{children}</span>
    </Tip>
  )
}
