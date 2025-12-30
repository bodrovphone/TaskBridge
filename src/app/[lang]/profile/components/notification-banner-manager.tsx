'use client'

import { useState } from 'react'
import { EmailVerificationBanner } from './email-verification-banner'
import { CheckInboxBanner } from './check-inbox-banner'

interface NotificationBannerManagerProps {
  emailVerified: boolean
  telegramConnected: boolean
}

export function NotificationBannerManager({
  emailVerified,
  telegramConnected,
}: NotificationBannerManagerProps) {
  const [checkInboxBannerDismissed, setCheckInboxBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('check_inbox_banner_dismissed') === 'true'
    }
    return false
  })

  const [emailVerificationSent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('email_verification_sent') === 'true'
    }
    return false
  })

  const handleCheckInboxDismiss = () => {
    setCheckInboxBannerDismissed(true)
    localStorage.setItem('check_inbox_banner_dismissed', 'true')
  }

  // Logic:
  // 1. Email verification sent AND not dismissed → Show "Check Inbox" banner (highest priority)
  // 2. Email not verified → Show Email verification banner
  // 3. Both verified → Show nothing
  // Note: Telegram prompts are handled via modal/toast, not banner

  const shouldShowCheckInboxBanner = emailVerificationSent && !checkInboxBannerDismissed && !emailVerified
  const shouldShowEmailBanner = !emailVerified && !shouldShowCheckInboxBanner

  // Don't show anything if email is verified
  if (emailVerified) {
    return null
  }

  return (
    <div className="mb-6">
      {shouldShowCheckInboxBanner && (
        <CheckInboxBanner onDismiss={handleCheckInboxDismiss} />
      )}
      {shouldShowEmailBanner && (
        <EmailVerificationBanner
          telegramConnected={telegramConnected}
        />
      )}
    </div>
  )
}
