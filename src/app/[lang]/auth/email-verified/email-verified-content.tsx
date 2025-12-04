'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { Button as NextUIButton, Card, CardBody, CardHeader } from '@nextui-org/react'
import { CheckCircle, Briefcase, Search, UserCircle } from 'lucide-react'

interface EmailVerifiedContentProps {
  lang: string
}

export function EmailVerifiedContent({ lang }: EmailVerifiedContentProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 text-center pb-0">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('auth.emailVerified.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('auth.emailVerified.description')}
            </p>
          </div>
        </CardHeader>

        <CardBody className="space-y-4 pt-6">
          <p className="text-center text-sm text-gray-600">
            {t('auth.emailVerified.whatNext')}
          </p>

          <div className="space-y-3">
            <Link href={`/${lang}/browse-tasks`} className="block">
              <NextUIButton
                color="primary"
                size="lg"
                className="w-full font-semibold"
                startContent={<Search className="w-5 h-5" />}
              >
                {t('auth.emailVerified.browseTasks')}
              </NextUIButton>
            </Link>

            <Link href={`/${lang}/create-task`} className="block">
              <NextUIButton
                color="secondary"
                variant="flat"
                size="lg"
                className="w-full font-semibold"
                startContent={<Briefcase className="w-5 h-5" />}
              >
                {t('auth.emailVerified.createTask')}
              </NextUIButton>
            </Link>

            <Link href={`/${lang}/profile`} className="block">
              <NextUIButton
                variant="bordered"
                size="lg"
                className="w-full font-semibold"
                startContent={<UserCircle className="w-5 h-5" />}
              >
                {t('auth.emailVerified.completeProfile')}
              </NextUIButton>
            </Link>
          </div>

          <div className="text-center pt-2">
            <Link
              href={`/${lang}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t('auth.emailVerified.goHome')}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
