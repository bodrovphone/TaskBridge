'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button as NextUIButton, Input, Card, CardBody, CardHeader } from '@heroui/react'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

interface ForgotPasswordContentProps {
  lang: string
}

export function ForgotPasswordContent({ lang }: ForgotPasswordContentProps) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check for expired token error from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'expired') {
      setError('Password reset link has expired. Please request a new one.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError(t('auth.forgotPassword.error'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get the base URL for the reset password redirect
      const redirectUrl = `${window.location.origin}/${lang}/reset-password`

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectUrl,
        }),
      })

      const data = await response.json()

      setIsLoading(false)

      if (!response.ok) {
        setError(data.error || t('auth.forgotPassword.error'))
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setIsLoading(false)
      setError(t('auth.forgotPassword.error'))
    }
  }

  const handleResend = async () => {
    setSuccess(false)
    setEmail('')
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-3 text-center pb-0">
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('auth.forgotPassword.checkEmail')}
              </h1>
            </div>
          </CardHeader>
          <CardBody className="text-center space-y-4">
            <p className="text-gray-600">
              {t('auth.forgotPassword.emailSent')}
            </p>
            <p className="font-medium text-gray-900">{email}</p>
            <p className="text-sm text-gray-600">
              {t('auth.forgotPassword.emailSentInstructions')}
            </p>

            <div className="pt-4 space-y-3">
              <Link href={`/${lang}`}>
                <NextUIButton color="primary" className="w-full">
                  {t('auth.forgotPassword.backToLogin')}
                </NextUIButton>
              </Link>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.forgotPassword.didNotReceive')}
                </p>
                <button
                  onClick={handleResend}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t('auth.forgotPassword.resendLink')}
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-blue-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 text-center pb-0">
          <div className="flex justify-center">
            <div className="bg-blue-100 rounded-full p-3">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('auth.forgotPassword.title')}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {t('auth.forgotPassword.description')}
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <Input
              type="email"
              label={t('auth.forgotPassword.emailLabel')}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              variant="bordered"
              size="lg"
            />

            <NextUIButton
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={isLoading}
              isDisabled={!email || isLoading}
            >
              {t('auth.forgotPassword.sendResetLink')}
            </NextUIButton>

            <div className="text-center">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
