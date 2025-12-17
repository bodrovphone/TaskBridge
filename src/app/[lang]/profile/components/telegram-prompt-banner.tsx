'use client'

import { useState } from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface TelegramPromptBannerProps {
  onConnect: () => void
  onDismiss: () => void
}

export function TelegramPromptBanner({ onConnect, onDismiss }: TelegramPromptBannerProps) {
  const t = useTranslations()

  return (
    <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardBody className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Telegram Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
            <Image
              src="/icons/telegram-logo.svg"
              alt="Telegram"
              width={32}
              height={32}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              📱 {t('profile.telegram.promptTitle')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('profile.telegram.promptDescription')}
            </p>
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
              onPress={onConnect}
              className="hover:scale-105 transition-transform shadow-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {t('profile.telegram.connectNow')}
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
