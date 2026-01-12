'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button as NextUIButton, Input, Card, CardBody, CardHeader } from '@heroui/react'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ResetPasswordContentProps {
  lang: string
}

export function ResetPasswordContent({ lang }: ResetPasswordContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if we have a valid session (from the reset link)
    // Session is established via /auth/callback before redirecting here
    const checkSession = async () => {
      const supabase = createClient()

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        setIsValidToken(false)
      } else {
        setIsValidToken(true)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!password || !confirmPassword) {
      setError(t('auth.resetPassword.error'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.resetPassword.passwordTooShort'))
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    setIsLoading(false)

    if (updateError) {
      setError(t('auth.resetPassword.error'))
    } else {
      setSuccess(true)
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push(`/${lang}`)
      }, 2000)
    }
  }

  // Show loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600">Loading...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-3 text-center pb-0">
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('auth.resetPassword.invalidToken')}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {t('auth.resetPassword.invalidTokenDescription')}
              </p>
            </div>
          </CardHeader>
          <CardBody className="text-center">
            <Link href={`/${lang}/forgot-password`}>
              <NextUIButton color="primary" className="w-full">
                {t('auth.forgotPassword.sendResetLink')}
              </NextUIButton>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Show success state
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
                {t('auth.resetPassword.success')}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {t('auth.resetPassword.successDescription')}
              </p>
            </div>
          </CardHeader>
          <CardBody className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to login...
            </p>
            <Link href={`/${lang}`}>
              <NextUIButton color="primary" className="w-full">
                {t('auth.resetPassword.goToLogin')}
              </NextUIButton>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Show reset password form
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-blue-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 text-center pb-0">
          <div className="flex justify-center">
            <div className="bg-blue-100 rounded-full p-3">
              <Lock className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('auth.resetPassword.title')}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {t('auth.resetPassword.description')}
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
              type="password"
              label={t('auth.resetPassword.newPassword')}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              variant="bordered"
              size="lg"
            />

            <Input
              type="password"
              label={t('auth.resetPassword.confirmPassword')}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              isDisabled={!password || !confirmPassword || isLoading}
            >
              {t('auth.resetPassword.resetButton')}
            </NextUIButton>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
