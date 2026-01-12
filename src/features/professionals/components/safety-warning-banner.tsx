'use client'

import { Card, CardBody } from '@heroui/react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type WarningType = 'negative_reviews' | 'multiple_reports'

interface SafetyWarningBannerProps {
  type: WarningType
  className?: string
}

export function SafetyWarningBanner({ type, className = '' }: SafetyWarningBannerProps) {
  const t = useTranslations()

  const config = {
    negative_reviews: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      titleKey: 'safety.negativeReviewsWarning',
      messageKey: 'safety.negativeReviewsWarningMessage'
    },
    multiple_reports: {
      icon: ShieldAlert,
      iconColor: 'text-danger',
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200',
      titleKey: 'safety.multipleReportsWarning',
      messageKey: 'safety.multipleReportsWarningMessage'
    }
  }

  const { icon: Icon, iconColor, bgColor, borderColor, titleKey, messageKey } = config[type]

  return (
    <Card className={`${bgColor} ${borderColor} border-2 shadow-sm ${className}`}>
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`font-semibold ${iconColor === 'text-warning' ? 'text-warning-900' : 'text-danger-900'} mb-1`}>
              {t(titleKey)}
            </p>
            <p className={`text-sm ${iconColor === 'text-warning' ? 'text-warning-700' : 'text-danger-700'}`}>
              {t(messageKey)}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
