'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
} from '@heroui/react'
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogIn,
  ArrowLeft,
  FileText,
  MessageSquare,
  Bell,
  Star,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface DeleteAccountContentProps {
  lang: string
}

interface Blocker {
  type: string
  task_id: string
  task_title: string
  task_status: string
  role: string
}

interface DeletionSummary {
  open_tasks: number
  pending_applications: number
  reviews_written: number
  reviews_received: number
  messages: number
  notifications: number
}

interface PreflightResponse {
  canDelete: boolean
  blockers: Blocker[]
  summary: DeletionSummary
}

export function DeleteAccountContent({ lang }: DeleteAccountContentProps) {
  const t = useTranslations()
  const { user, profile, loading: authLoading, signInWithGoogle, signInWithFacebook } = useAuth()

  const [preflight, setPreflight] = useState<PreflightResponse | null>(null)
  const [preflightLoading, setPreflightLoading] = useState(false)
  const [preflightError, setPreflightError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Determine if user is OAuth (no password needed)
  const isOAuthUser = profile?.email && !profile?.email.includes('@') === false // Simple heuristic, will be overridden by actual check

  // Fetch preflight data when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchPreflight()
    }
  }, [user, authLoading])

  const fetchPreflight = async () => {
    setPreflightLoading(true)
    setPreflightError(null)

    try {
      const response = await fetch('/api/account/preflight')

      if (!response.ok) {
        throw new Error(t('accountDeletion.preflightError'))
      }

      const data = await response.json()
      setPreflight(data)
    } catch (error) {
      setPreflightError(error instanceof Error ? error.message : t('accountDeletion.unknownError'))
    } finally {
      setPreflightLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401 && data.error === 'Invalid password') {
          setDeleteError(t('accountDeletion.invalidPassword'))
        } else if (response.status === 409) {
          setDeleteError(t('accountDeletion.hasActiveTasksError'))
          // Refresh preflight to show updated blockers
          fetchPreflight()
        } else {
          setDeleteError(data.error || t('accountDeletion.deleteError'))
        }
        return
      }

      // Success - hard redirect to clear all cached state
      window.location.href = `/${lang}?deleted=true`
    } catch (error) {
      setDeleteError(t('accountDeletion.deleteError'))
    } finally {
      setDeleteLoading(false)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-lg">
          <CardBody className="flex items-center justify-center py-12">
            <Spinner size="lg" color="danger" />
          </CardBody>
        </Card>
      </div>
    )
  }

  // Not authenticated - show info + login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-lg">
          <CardHeader className="flex flex-col gap-3 text-center pb-0">
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <Trash2 className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('accountDeletion.title')}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {t('accountDeletion.loginRequired')}
              </p>
            </div>
          </CardHeader>

          <CardBody className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">
                {t('accountDeletion.whatHappens')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {t('accountDeletion.profileRemoved')}
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {t('accountDeletion.tasksCancelled')}
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {t('accountDeletion.reviewsAnonymized')}
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {t('accountDeletion.cannotUndo')}
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                color="primary"
                size="lg"
                className="w-full"
                startContent={<LogIn className="w-5 h-5" />}
                onPress={() => signInWithGoogle()}
              >
                {t('accountDeletion.loginWithGoogle')}
              </Button>

              <Button
                color="primary"
                variant="bordered"
                size="lg"
                className="w-full"
                onPress={() => signInWithFacebook()}
              >
                {t('accountDeletion.loginWithFacebook')}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('accountDeletion.backToHome')}
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Authenticated but loading preflight
  if (preflightLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-lg">
          <CardBody className="flex flex-col items-center justify-center py-12 gap-4">
            <Spinner size="lg" color="danger" />
            <p className="text-gray-600">{t('accountDeletion.checkingStatus')}</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Preflight error
  if (preflightError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-lg">
          <CardHeader className="flex flex-col gap-3 text-center pb-0">
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('accountDeletion.errorTitle')}
              </h1>
            </div>
          </CardHeader>
          <CardBody className="text-center space-y-4">
            <p className="text-gray-600">{preflightError}</p>
            <Button color="primary" onPress={fetchPreflight}>
              {t('accountDeletion.tryAgain')}
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Has blockers - cannot delete yet
  if (preflight && !preflight.canDelete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-lg">
          <CardHeader className="flex flex-col gap-3 text-center pb-0">
            <div className="flex justify-center">
              <div className="bg-yellow-100 rounded-full p-4">
                <AlertTriangle className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('accountDeletion.cannotDeleteYet')}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {t('accountDeletion.completeTasksFirst')}
              </p>
            </div>
          </CardHeader>

          <CardBody className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-yellow-800">
                {t('accountDeletion.activeWork')}
              </h3>
              <ul className="space-y-2">
                {preflight.blockers.map((blocker, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-800">
                      <strong>{blocker.task_title}</strong>
                      <span className="text-yellow-600 ml-1">
                        ({blocker.role === 'customer'
                          ? t('accountDeletion.asCustomer')
                          : t('accountDeletion.asProfessional')})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                as={Link}
                href={`/${lang}/tasks/posted`}
                color="primary"
                size="lg"
                className="w-full"
              >
                {t('accountDeletion.viewMyTasks')}
              </Button>

              <div className="text-center">
                <Link
                  href={`/${lang}/profile/customer`}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('accountDeletion.backToProfile')}
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Can delete - show confirmation
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-col gap-3 text-center pb-0">
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <Trash2 className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('accountDeletion.confirmTitle')}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {t('accountDeletion.confirmDescription')}
            </p>
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Pre-flight status */}
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {t('accountDeletion.readyToDelete')}
            </span>
          </div>

          {/* Summary of what will be affected */}
          {preflight?.summary && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">
                {t('accountDeletion.willBeDeleted')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {preflight.summary.open_tasks > 0 && (
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {t('accountDeletion.openTasksCount', { count: preflight.summary.open_tasks })}
                  </li>
                )}
                {preflight.summary.pending_applications > 0 && (
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {t('accountDeletion.applicationsCount', { count: preflight.summary.pending_applications })}
                  </li>
                )}
                {preflight.summary.messages > 0 && (
                  <li className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    {t('accountDeletion.messagesCount', { count: preflight.summary.messages })}
                  </li>
                )}
                {preflight.summary.notifications > 0 && (
                  <li className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    {t('accountDeletion.notificationsCount', { count: preflight.summary.notifications })}
                  </li>
                )}
              </ul>

              {(preflight.summary.reviews_written > 0 || preflight.summary.reviews_received > 0) && (
                <>
                  <h3 className="font-medium text-gray-900 pt-2">
                    {t('accountDeletion.willBeAnonymized')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {preflight.summary.reviews_written > 0 && (
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {t('accountDeletion.reviewsWrittenCount', { count: preflight.summary.reviews_written })}
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                {t('accountDeletion.irreversibleWarning')}
              </p>
            </div>
          </div>

          {/* Password confirmation */}
          <div className="space-y-4">
            {/* Show password field with explanation */}
            <div className="space-y-2">
              <Input
                type="password"
                label={t('accountDeletion.confirmPassword')}
                placeholder={t('accountDeletion.enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="bordered"
              />
              <p className="text-xs text-gray-500">
                {t('accountDeletion.passwordOptionalNote')}
              </p>
              <Link
                href={`/${lang}/forgot-password`}
                className="text-xs text-primary hover:underline"
              >
                {t('accountDeletion.noPasswordLink')}
              </Link>
            </div>

            {deleteError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {deleteError}
              </div>
            )}

            <Button
              color="danger"
              size="lg"
              className="w-full font-semibold"
              isLoading={deleteLoading}
              onPress={handleDelete}
              startContent={!deleteLoading && <Trash2 className="w-5 h-5" />}
            >
              {t('accountDeletion.deleteButton')}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href={`/${lang}/profile/customer`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('accountDeletion.cancel')}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
