'use client'

import { Button } from '@nextui-org/react'
import { AlertCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NotificationSetupChipProps {
  onSetup: () => void
  onDismiss: () => void
}

/**
 * Compact notification setup prompt (single line, minimal space)
 *
 * Displayed when user has no notification channels configured.
 * Non-blocking and dismissible for better mobile UX.
 */
export function NotificationSetupChip({
  onSetup,
  onDismiss,
}: NotificationSetupChipProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <p className="text-xs text-amber-800 flex-1">
        {t('notificationWarning.compact')}
      </p>
      <Button
        size="sm"
        variant="flat"
        color="warning"
        onPress={onSetup}
        className="hover:scale-105 transition-transform font-semibold min-w-[70px]"
      >
        {t('notificationWarning.setup')}
      </Button>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-full hover:bg-amber-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-amber-600" />
      </button>
    </div>
  )
}
