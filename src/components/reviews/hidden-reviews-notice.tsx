'use client'

import { Card, CardBody, Tooltip } from '@nextui-org/react'
import { Info, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface HiddenReviewsNoticeProps {
  hiddenCount: number
  hasPattern: boolean
  className?: string
}

/**
 * Shows a notice when reviews are hidden due to pending pattern detection
 * or when a pattern has been detected and all negative reviews are visible
 */
export function HiddenReviewsNotice({
  hiddenCount,
  hasPattern,
  className = ''
}: HiddenReviewsNoticeProps) {
  const { t } = useTranslation()

  // Pattern detected - all negative reviews visible
  if (hasPattern) {
    return (
      <Card className={`bg-amber-50 border-2 border-amber-200 shadow-sm ${className}`}>
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">
                {t('reviews.patternDetected')}
              </p>
              <p className="text-sm text-amber-700">
                {t('reviews.allNegativeVisible')}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Hidden reviews notice (no pattern yet)
  if (hiddenCount > 0) {
    const countText = hiddenCount === 1
      ? t('reviews.hiddenCountSingular')
      : t('reviews.hiddenCountPlural', { count: hiddenCount })

    return (
      <Card className={`bg-blue-50 border-2 border-blue-200 shadow-sm ${className}`}>
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <Tooltip content={t('reviews.hiddenReviewsTooltip')} placement="bottom">
              <div className="flex items-center gap-2 cursor-help">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">{t('reviews.hiddenReviewsNotice')}</span>
                    {' '}
                    <span className="text-blue-700">({countText})</span>
                  </p>
                </div>
              </div>
            </Tooltip>
          </div>
        </CardBody>
      </Card>
    )
  }

  // No hidden reviews - don't show anything
  return null
}
