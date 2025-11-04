'use client'

import { useState } from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TelegramPromptBannerProps {
  onConnect: () => void
  onDismiss: () => void
}

export function TelegramPromptBanner({ onConnect, onDismiss }: TelegramPromptBannerProps) {
  const { t } = useTranslation()

  return (
    <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardBody className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Telegram Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Send className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              📱 {t('profile.telegram.promptTitle', 'Get Instant Notifications!')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('profile.telegram.promptDescription', 'Connect your Telegram account to receive real-time updates about your tasks, applications, and messages.')}
            </p>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<Send className="w-4 h-4" />}
              onPress={onConnect}
              className="hover:scale-105 transition-transform shadow-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {t('profile.telegram.connectNow', 'Connect Telegram')}
            </Button>
          </div>

          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </CardBody>
    </Card>
  )
}
