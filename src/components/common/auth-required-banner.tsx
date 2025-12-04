'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, Button } from '@nextui-org/react'
import { LogIn } from 'lucide-react'
import AuthSlideOver from '@/components/ui/auth-slide-over'

interface AuthRequiredBannerProps {
  /** Custom title - falls back to generic translation */
  title?: string
  /** Custom description - falls back to generic translation */
  description?: string
  /** Custom hint text - falls back to generic translation */
  hint?: string
}

/**
 * Generic banner shown on protected pages when user is not authenticated.
 * Provides a single unified sign-in button that opens the auth slide-over.
 */
export function AuthRequiredBanner({ title, description, hint }: AuthRequiredBannerProps) {
  const { t } = useTranslation()
  const [showAuthSlideOver, setShowAuthSlideOver] = useState(false)

  return (
    <>
      <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <CardBody className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <LogIn className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {title || t('authRequired.title')}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {description || t('authRequired.description')}
          </p>
          <div className="flex justify-center">
            <Button
              variant="bordered"
              size="lg"
              startContent={<LogIn className="w-5 h-5" style={{ color: '#0066CC' }} />}
              onPress={() => setShowAuthSlideOver(true)}
              className="bg-white shadow-md font-semibold px-8 border-blue-500"
              style={{ color: '#0066CC' }}
            >
              {t('authRequired.signIn')}
            </Button>
          </div>
          {(hint || t('authRequired.hint')) && (
            <p className="text-gray-400 text-sm mt-6">
              {hint || t('authRequired.hint')}
            </p>
          )}
        </CardBody>
      </Card>

      <AuthSlideOver
        isOpen={showAuthSlideOver}
        onClose={() => setShowAuthSlideOver(false)}
        action={null}
      />
    </>
  )
}
