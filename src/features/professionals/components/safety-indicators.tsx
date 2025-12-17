'use client'

import { Chip, Tooltip } from '@nextui-org/react'
import { Shield, Phone, Mail, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface SafetyStatus {
  phoneVerified: boolean
  emailVerified: boolean
  cleanSafetyRecord: boolean
  hasNegativeReviews: boolean
  multipleReports: boolean
}

interface SafetyIndicatorsProps {
  safetyStatus: SafetyStatus
  /**
   * Display mode:
   * - 'badges': Show as horizontal badge list (for profiles)
   * - 'compact': Show key indicators only (for cards)
   */
  mode?: 'badges' | 'compact'
  className?: string
}

export function SafetyIndicators({
  safetyStatus,
  mode = 'badges',
  className = ''
}: SafetyIndicatorsProps) {
  const t = useTranslations()

  if (mode === 'compact') {
    // Compact mode: Show only critical indicators
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {safetyStatus.phoneVerified && (
          <Tooltip content={t('safety.phoneVerified')}>
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success-100">
              <Phone className="w-3 h-3 text-success-600" />
            </div>
          </Tooltip>
        )}

        {safetyStatus.cleanSafetyRecord && (
          <Tooltip content={t('safety.cleanRecord')}>
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success-100">
              <Shield className="w-3 h-3 text-success-600" />
            </div>
          </Tooltip>
        )}

        {safetyStatus.hasNegativeReviews && (
          <Tooltip content={t('safety.hasNegativeReviews')}>
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-warning-100">
              <AlertTriangle className="w-3 h-3 text-warning-600" />
            </div>
          </Tooltip>
        )}
      </div>
    )
  }

  // Badges mode: Full display with text labels
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Phone Verified */}
      {safetyStatus.phoneVerified && (
        <Chip
          startContent={<Phone className="w-3 h-3" />}
          size="sm"
          color="success"
          variant="flat"
          className="text-xs"
        >
          {t('safety.phoneVerified')}
        </Chip>
      )}

      {/* Email Verified */}
      {safetyStatus.emailVerified && (
        <Chip
          startContent={<Mail className="w-3 h-3" />}
          size="sm"
          color="success"
          variant="flat"
          className="text-xs"
        >
          {t('safety.emailVerified')}
        </Chip>
      )}

      {/* Clean Safety Record - Only show if true */}
      {safetyStatus.cleanSafetyRecord && (
        <Chip
          startContent={<CheckCircle className="w-3 h-3" />}
          size="sm"
          color="success"
          variant="flat"
          className="text-xs font-medium"
        >
          {t('safety.cleanRecord')}
        </Chip>
      )}

      {/* Negative Reviews Warning */}
      {safetyStatus.hasNegativeReviews && (
        <Tooltip content={t('safety.negativeReviewsTooltip')} placement="bottom">
          <Chip
            startContent={<AlertTriangle className="w-3 h-3" />}
            size="sm"
            color="warning"
            variant="flat"
            className="text-xs font-medium cursor-help"
          >
            {t('safety.hasNegativeReviews')}
          </Chip>
        </Tooltip>
      )}

      {/* Multiple Reports Warning */}
      {safetyStatus.multipleReports && (
        <Tooltip content={t('safety.multipleReportsTooltip')} placement="bottom">
          <Chip
            startContent={<AlertTriangle className="w-3 h-3" />}
            size="sm"
            color="danger"
            variant="flat"
            className="text-xs font-medium cursor-help"
          >
            {t('safety.multipleReports')}
          </Chip>
        </Tooltip>
      )}
    </div>
  )
}
