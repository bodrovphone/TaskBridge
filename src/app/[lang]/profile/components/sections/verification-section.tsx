'use client'

import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react'
import { useTranslations } from 'next-intl'
import { Shield, Phone, CheckCircle } from 'lucide-react'

interface VerificationSectionProps {
  phoneNumber: string | null
  isPhoneVerified: boolean
  onVerifyPhone: () => void
}

export function VerificationSection({ phoneNumber, isPhoneVerified, onVerifyPhone }: VerificationSectionProps) {
  const t = useTranslations()

  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-100">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            {t('profile.professional.verificationTrust')}
          </h3>
        </div>
      </CardHeader>
      <CardBody className="px-4 md:px-6">
        {/* Phone Verification - Reuses same phone number from customer profile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t('profile.professional.phoneVerification')}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <p className="text-sm text-gray-900 font-semibold">{phoneNumber || t('profile.professional.notSet')}</p>
                {phoneNumber && (
                  isPhoneVerified ? (
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle className="w-3 h-3" />}
                      className="flex-shrink-0"
                    >
                      {t('profile.professional.verified')}
                    </Chip>
                  ) : (
                    <Chip
                      size="sm"
                      color="warning"
                      variant="flat"
                      className="flex-shrink-0"
                    >
                      {t('profile.professional.notVerified')}
                    </Chip>
                  )
                )}
              </div>
              {phoneNumber && !isPhoneVerified && (
                <p className="text-xs text-gray-500 mt-1">{t('profile.professional.phoneVerificationRequired')}</p>
              )}
            </div>
          </div>
          {phoneNumber && !isPhoneVerified && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="self-start sm:self-auto flex-shrink-0"
              onPress={onVerifyPhone}
            >
              {t('profile.professional.verifyPhone')}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
