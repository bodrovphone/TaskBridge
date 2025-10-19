'use client'

import { Card, CardBody, Button } from '@nextui-org/react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PendingConfirmationBannerProps {
  status: 'pending_professional_confirmation' | 'pending_customer_confirmation'
  userRole: 'customer' | 'professional'
  otherPartyName: string
  onConfirm?: () => void
  onReject?: () => void
  className?: string
}

export function PendingConfirmationBanner({
  status,
  userRole,
  otherPartyName,
  onConfirm,
  onReject,
  className = ''
}: PendingConfirmationBannerProps) {
  const { t } = useTranslation()

  // Check if current user is waiting or needs to act
  const isWaiting =
    (status === 'pending_customer_confirmation' && userRole === 'professional') ||
    (status === 'pending_professional_confirmation' && userRole === 'customer')

  if (isWaiting) {
    // User is waiting for other party to confirm
    return (
      <Card className={`bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 ${className}`}>
        <CardBody className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-orange-100 flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900 mb-1">
                {status === 'pending_customer_confirmation'
                  ? t('taskCompletion.pending.waitingCustomer')
                  : t('taskCompletion.pending.waitingProfessional')}
              </h3>
              <p className="text-sm text-orange-700">
                {t('taskCompletion.pending.youMarked')} {t('taskCompletion.pending.waitingFor')} <span className="font-semibold">{otherPartyName}</span> {t('taskCompletion.pending.toConfirm')}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // User needs to confirm or reject
  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg ${className}`}>
      <CardBody className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-1">
                {status === 'pending_customer_confirmation'
                  ? t('taskCompletion.pending.professionalMarkedComplete')
                  : t('taskCompletion.pending.customerMarkedComplete')}
              </h3>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">{otherPartyName}</span> {t('taskCompletion.pending.markedComplete')}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {onReject && (
              <Button
                variant="bordered"
                color="danger"
                startContent={<XCircle className="w-4 h-4" />}
                onPress={onReject}
                className="flex-1 md:flex-initial"
              >
                {t('taskCompletion.reject.button')}
              </Button>
            )}
            {onConfirm && (
              <Button
                color="success"
                startContent={<CheckCircle className="w-4 h-4" />}
                onPress={onConfirm}
                className="flex-1 md:flex-initial shadow-lg"
              >
                {t('taskCompletion.confirmCompletion')}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
