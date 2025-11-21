'use client'

import { useState } from 'react'
import { TelegramPromptBanner } from './telegram-prompt-banner'
import { EmailVerificationBanner } from './email-verification-banner'
import { CheckInboxBanner } from './check-inbox-banner'

interface NotificationBannerManagerProps {
  emailVerified: boolean
  telegramConnected: boolean
  onTelegramConnect: () => void
}

export function NotificationBannerManager({
  emailVerified,
  telegramConnected,
  onTelegramConnect,
}: NotificationBannerManagerProps) {
  const [telegramBannerDismissed, setTelegramBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegram_banner_dismissed') === 'true'
    }
    return false
  })

  const [checkInboxBannerDismissed, setCheckInboxBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('check_inbox_banner_dismissed') === 'true'
    }
    return false
  })

  const [emailVerificationSent, setEmailVerificationSent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('email_verification_sent') === 'true'
    }
    return false
  })

  const handleTelegramDismiss = () => {
    setTelegramBannerDismissed(true)
    localStorage.setItem('telegram_banner_dismissed', 'true')
  }

  const handleCheckInboxDismiss = () => {
    setCheckInboxBannerDismissed(true)
    localStorage.setItem('check_inbox_banner_dismissed', 'true')
  }

  // Logic:
  // 1. Email verification sent AND not dismissed → Show "Check Inbox" banner (highest priority)
  // 2. Telegram NOT connected + NOT dismissed → Show Telegram banner (top)
  // 3. Telegram dismissed OR connected → Show Email banner (top) if email not verified
  // 4. Both verified → Show nothing

  const shouldShowCheckInboxBanner = emailVerificationSent && !checkInboxBannerDismissed && !emailVerified
  const shouldShowTelegramBanner = !telegramConnected && !telegramBannerDismissed && !shouldShowCheckInboxBanner
  const shouldShowEmailBannerTop = (telegramConnected || telegramBannerDismissed) && !emailVerified && !shouldShowCheckInboxBanner

  // Don't show anything if both are verified
  if (emailVerified && telegramConnected) {
    return null
  }

  return (
    <div className="mb-6">
      {shouldShowCheckInboxBanner && (
        <CheckInboxBanner onDismiss={handleCheckInboxDismiss} />
      )}
      {shouldShowTelegramBanner && (
        <TelegramPromptBanner
          onConnect={onTelegramConnect}
          onDismiss={handleTelegramDismiss}
        />
      )}
      {shouldShowEmailBannerTop && (
        <EmailVerificationBanner
          telegramConnected={telegramConnected}
        />
      )}
    </div>
  )
}
