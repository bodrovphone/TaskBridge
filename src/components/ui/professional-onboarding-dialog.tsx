'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react'
import { Briefcase } from 'lucide-react'
import { useAuth } from '@/features/auth'

/**
 * Global Professional Onboarding Dialog
 *
 * This dialog appears after login/registration when a user showed professional intent
 * (clicked "Find Work", "Browse Tasks", etc. before authenticating).
 *
 * It asks them to confirm they want to set up a professional profile,
 * then redirects to the profile page.
 *
 * Key behaviors:
 * - Shows for BOTH login and registration (not just new users)
 * - Only shows ONCE per user (tracked via trudify_onboarding_dialog_dismissed)
 * - Only shows if user doesn't have a complete professional profile
 *
 * Triggers:
 * - localStorage: trudify_show_onboarding_dialog = 'true' (email/password auth)
 * - cookie: trudify_show_onboarding_dialog = 'true' (OAuth auth)
 */
export default function ProfessionalOnboardingDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false) // Prevent re-opening after user action
  const router = useRouter()
  const params = useParams()
  const t = useTranslations()
  const { profile } = useAuth()
  const currentLocale = (params?.lang as string) || 'bg'

  // Check for the dialog trigger on mount and when profile changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasInteracted) return // Don't re-open after user has interacted

    const checkTrigger = () => {
      // Wait for language preference prompt to be dismissed first (it has priority)
      const languagePromptActive = sessionStorage.getItem('trudify_language_prompt_active') === 'true'
      if (languagePromptActive) {
        // Retry after a delay - language prompt will clear the flag when dismissed
        setTimeout(checkTrigger, 500)
        return
      }

      // Check if user has already dismissed this dialog (only show once ever)
      const alreadyDismissed = localStorage.getItem('trudify_onboarding_dialog_dismissed') === 'true'
      if (alreadyDismissed) {
        // Clean up any stale flags
        localStorage.removeItem('trudify_show_onboarding_dialog')
        document.cookie = 'trudify_show_onboarding_dialog=; path=/; max-age=0'
        return
      }

      // Check localStorage (set by email/password auth)
      const localStorageFlag = localStorage.getItem('trudify_show_onboarding_dialog')

      // Check cookie (set by OAuth callback)
      const cookieFlag = document.cookie
        .split('; ')
        .find(row => row.startsWith('trudify_show_onboarding_dialog='))
        ?.split('=')[1]

      if (localStorageFlag === 'true' || cookieFlag === 'true') {
        // Only show if user doesn't already have a professional profile
        // hasProfessionalProfile requires: title (3+ chars), categories (1+)
        // Bio is optional - not required for listing
        const hasProfessionalProfile = profile?.professionalTitle &&
          profile?.professionalTitle.length >= 3 &&
          profile?.serviceCategories &&
          profile?.serviceCategories.length > 0

        if (!hasProfessionalProfile) {
          setIsOpen(true)
        }

        // Clear the flags
        localStorage.removeItem('trudify_show_onboarding_dialog')
        // Clear cookie by setting it to expire immediately
        document.cookie = 'trudify_show_onboarding_dialog=; path=/; max-age=0'
      }
    }

    // Small delay to ensure auth state is ready
    const timeout = setTimeout(checkTrigger, 500)
    return () => clearTimeout(timeout)
  }, [profile, hasInteracted])

  const handleConfirm = useCallback(() => {
    // Mark as interacted to prevent re-opening during navigation
    setHasInteracted(true)
    // Mark as dismissed so it never shows again
    localStorage.setItem('trudify_onboarding_dialog_dismissed', 'true')
    setIsOpen(false)
    router.push(`/${currentLocale}/profile/professional`)
  }, [router, currentLocale])

  const handleDecline = useCallback(() => {
    // Mark as interacted to prevent re-opening
    setHasInteracted(true)
    // Mark as dismissed so it never shows again
    localStorage.setItem('trudify_onboarding_dialog_dismissed', 'true')
    setIsOpen(false)
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDecline}
      size="md"
      placement="center"
      backdrop="opaque"
      classNames={{
        backdrop: "bg-black/70",
        base: "border border-gray-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              {t('auth.professionalOnboarding.title')}
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="py-4">
          <p className="text-gray-600 text-base leading-relaxed">
            {t('auth.professionalOnboarding.description')}
          </p>
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-800">
              {t('auth.professionalOnboarding.benefits')}
            </p>
          </div>
        </ModalBody>

        <ModalFooter className="pt-2">
          <Button
            variant="flat"
            onPress={handleDecline}
            className="text-gray-600"
          >
            {t('auth.professionalOnboarding.later')}
          </Button>
          <Button
            color="success"
            onPress={handleConfirm}
            className="font-medium"
          >
            {t('auth.professionalOnboarding.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
