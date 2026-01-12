'use client'

import { Card, CardBody, Button } from '@heroui/react'
import { AlertTriangle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface NotificationWarningBannerProps {
  onConnectTelegram: () => void
  onVerifyEmail: () => void
  onDismiss: () => void
}

/**
 * Warning banner shown when user has no notification channels configured
 * (neither Telegram connected nor email verified)
 *
 * Displayed on:
 * - Create task form (for customers)
 * - Apply to task dialog (for professionals)
 *
 * Non-blocking: users can still proceed with actions
 */
export function NotificationWarningBanner({
  onConnectTelegram,
  onVerifyEmail,
  onDismiss,
}: NotificationWarningBannerProps) {
  const t = useTranslations()

  return (
    <Card className="shadow-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardBody className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-amber-900 mb-1">
              {t('notificationWarning.title')}
            </h3>
            <p className="text-sm text-amber-800 mb-2">
              {t('notificationWarning.message')}
            </p>
            <p className="text-xs text-amber-700 mb-4">
              {t('notificationWarning.recommendation')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={
                  <Image
                    src="/icons/telegram-logo.svg"
                    alt="Telegram"
                    width={16}
                    height={16}
                  />
                }
                onPress={onConnectTelegram}
                className="hover:scale-105 transition-transform shadow-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              >
                {t('notificationWarning.connectTelegram')}
              </Button>

              <Button
                size="sm"
                variant="flat"
                color="warning"
                onPress={onVerifyEmail}
                className="hover:scale-105 transition-transform shadow-sm font-semibold"
              >
                {t('notificationWarning.verifyEmail')}
              </Button>

              <Button
                size="sm"
                variant="light"
                onPress={onDismiss}
                className="text-amber-700 hover:bg-amber-100"
              >
                {t('notificationWarning.dismiss')}
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-amber-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-amber-600" />
          </button>
        </div>
      </CardBody>
    </Card>
  )
}
