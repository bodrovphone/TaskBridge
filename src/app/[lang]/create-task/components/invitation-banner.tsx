'use client'

import { UserPlus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@nextui-org/react'

interface InvitationBannerProps {
  professionalName: string
  onCancel: () => void
}

export function InvitationBanner({ professionalName, onCancel }: InvitationBannerProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-8 overflow-hidden">
      <div className="p-6 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            {t('createTask.inviteBanner.title', 'Inviting a Professional')}
          </h3>
          <p className="text-blue-50 leading-relaxed">
            {t('createTask.inviteBanner.description', {
              defaultValue: "You're creating a task to invite <strong>{{name}}</strong>. They will be notified immediately after you publish this task.",
              name: professionalName,
            })}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>
              {t('createTask.inviteBanner.notification', 'Notification will be sent via Telegram and in-app')}
            </span>
          </div>
        </div>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-white hover:bg-white/20"
          onPress={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
