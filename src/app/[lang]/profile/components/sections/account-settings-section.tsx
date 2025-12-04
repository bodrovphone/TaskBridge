'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, CardHeader, Button } from '@nextui-org/react'
import { Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { TelegramConnection } from '../telegram-connection'

interface AccountSettingsSectionProps {
  lang: string
  userId: string
  telegramConnected: boolean
  telegramUsername?: string | null
  telegramFirstName?: string | null
  onTelegramConnectionChange?: () => void
}

export function AccountSettingsSection({
  lang,
  userId,
  telegramConnected,
  telegramUsername,
  telegramFirstName,
  onTelegramConnectionChange
}: AccountSettingsSectionProps) {
  const { t } = useTranslation()

  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100 flex-shrink-0">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.settings')}</h3>
            <p className="text-xs text-gray-500 hidden sm:block">{t('profile.settings.description')}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-4 md:px-6 space-y-6">
        {/* Telegram Connection */}
        <TelegramConnection
          userId={userId}
          telegramConnected={telegramConnected}
          telegramUsername={telegramUsername}
          telegramFirstName={telegramFirstName}
          onConnectionChange={onTelegramConnectionChange}
        />

        {/* Danger Zone */}
        <div className="p-4 rounded-xl border-2 border-danger-200 bg-danger-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-danger-100">
              <Trash2 className="w-5 h-5 text-danger" />
            </div>
            <h4 className="font-semibold text-danger">{t('profile.settings.dangerZone')}</h4>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t('profile.settings.deleteAccountDesc')}
            </p>
            <Button
              as={Link}
              href={`/${lang}/account/delete`}
              variant="bordered"
              color="danger"
              size="sm"
            >
              {t('profile.settings.deleteAccount')}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
