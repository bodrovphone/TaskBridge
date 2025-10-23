'use client'

import { Card, CardBody } from '@nextui-org/react'
import { ShieldX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface SuspensionBannerProps {
  suspensionReason?: string
  className?: string
}

/**
 * Banner displayed on suspended user profiles warning visitors
 */
export function SuspensionBanner({
  suspensionReason,
  className = ''
}: SuspensionBannerProps) {
  const { t } = useTranslation()

  return (
    <Card className={`bg-danger-50 border-2 border-danger-200 shadow-lg ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ShieldX className="w-8 h-8 text-danger" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-danger-900 mb-2">
              {t('suspension.accountSuspended')}
            </h3>
            <p className="text-danger-800 mb-3">
              {suspensionReason || t('suspension.message')}
            </p>
            <div className="text-sm text-danger-700">
              <p>{t('suspension.appeal')}</p>
              <p className="mt-1 font-semibold">{t('suspension.contactEmail')}</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
