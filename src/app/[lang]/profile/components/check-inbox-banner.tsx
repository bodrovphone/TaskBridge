'use client'

import { Card, CardBody, Button } from '@heroui/react'
import { Mail, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CheckInboxBannerProps {
  onDismiss: () => void
}

export function CheckInboxBanner({ onDismiss }: CheckInboxBannerProps) {
  const t = useTranslations()

  return (
    <Card className="shadow-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardBody className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Mail Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
            <Mail className="w-7 h-7 text-green-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ✉️ {t('profile.email.checkInboxTitle')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('profile.email.checkInboxMessage')}
            </p>
            <p className="text-xs text-gray-500">
              {t('profile.email.checkSpam')}
            </p>
          </div>

          {/* Dismiss Button */}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
