'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, Button } from '@nextui-org/react'
import { RefreshCw, X } from 'lucide-react'

interface ReopenBannerProps {
  originalTaskTitle: string
  onStartFresh: () => void
}

export function ReopenBanner({ originalTaskTitle, onStartFresh }: ReopenBannerProps) {
  const { t } = useTranslation()

  return (
    <Card className="bg-blue-50 border-2 border-blue-200 shadow-md mb-6">
      <CardBody className="flex flex-row items-start gap-4 p-4">
        <div className="flex-shrink-0 mt-1">
          <RefreshCw className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            {t('createTask.reopeningBanner.title', 'Reopening Task')}
          </h3>
          <p className="text-sm text-blue-800 mb-2">
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
        <Button
          color="primary"
          variant="flat"
          size="sm"
          startContent={<X className="w-4 h-4" />}
          onPress={onStartFresh}
          className="flex-shrink-0"
        >
          {t('createTask.reopeningBanner.startFresh', 'Start Fresh')}
        </Button>
      </CardBody>
    </Card>
  )
}
