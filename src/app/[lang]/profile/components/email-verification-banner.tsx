'use client'

import { useState } from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { X, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth'

interface EmailVerificationBannerProps {
  telegramConnected: boolean
}

export function EmailVerificationBanner({ telegramConnected }: EmailVerificationBannerProps) {
  const t = useTranslations()
  const { authenticatedFetch } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/api/auth/resend-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: t('profile.email.verificationFailed'),
          description: data.error,
          variant: 'destructive',
        })
        return
      }

      // Mark that verification email was sent
      if (typeof window !== 'undefined') {
        localStorage.setItem('email_verification_sent', 'true')
        localStorage.setItem('email_verification_sent_time', Date.now().toString())
      }

      toast({
        title: t('profile.email.verificationSent'),
      })

      // Trigger page refresh to show the check inbox banner
      window.location.reload()
    } catch (error) {
      console.error('Failed to resend verification email:', error)
      toast({
        title: t('profile.email.verificationFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardBody className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Mail Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              📧 {t('profile.email.promptTitle')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {telegramConnected
                ? t('profile.email.promptDescriptionSecurity')
                : t('profile.email.promptDescription')
              }
            </p>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<Mail className="w-4 h-4" />}
              onPress={handleResendVerification}
              isLoading={isLoading}
              className="hover:scale-105 transition-transform shadow-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {t('profile.email.sendVerification')}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
