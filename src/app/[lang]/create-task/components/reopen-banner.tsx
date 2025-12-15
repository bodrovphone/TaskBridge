'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody } from '@nextui-org/react'
import { RefreshCw } from 'lucide-react'

interface ReopenBannerProps {
  originalTaskTitle: string
}

export function ReopenBanner({ originalTaskTitle }: ReopenBannerProps) {
  const { t } = useTranslation()

  return (
    <Card className="bg-blue-50 border-2 border-blue-200 shadow-md mb-6">
      <CardBody className="flex flex-row items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-blue-900 mb-1">
            {t('createTask.reopeningBanner.title', 'Reopening Task')}
          </h3>
          <p className="text-sm text-blue-800 mb-1">
            <span className="font-medium">
              {t('createTask.reopeningBanner.originalTask', 'Original task:')}
            </span>{' '}
            {originalTaskTitle}
          </p>
          <p className="text-sm text-blue-700">
            {t(
              'createTask.reopeningBanner.description',
              'Review and edit the details below before posting. This will create a new task.'
            )}
          </p>
        </div>
      </CardBody>
    </Card>
  )
}
