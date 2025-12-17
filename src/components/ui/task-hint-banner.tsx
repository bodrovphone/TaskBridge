'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { Lightbulb, X, Edit } from 'lucide-react'

export interface TaskHint {
  type: string
  priority: 'high' | 'medium' | 'low'
  message: string
}

interface TaskHintBannerProps {
  taskId: string
  taskAge: number
  hints: TaskHint[]
  onDismiss: () => void
}

export function TaskHintBanner({ taskId, taskAge, hints, onDismiss }: TaskHintBannerProps) {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang as string

  if (hints.length === 0) {
    return null
  }

  const handleImproveTask = () => {
    router.push(`/${lang}/tasks/${taskId}/edit`)
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-4 shadow-md">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-semibold text-yellow-900 mb-2">
            {t('taskHints.noApplications.title', { days: taskAge })}
          </p>

          {/* Suggestions List */}
          <ul className="text-xs text-yellow-800 space-y-1 mb-3">
            {hints.map((hint, index) => (
              <li key={`${hint.type}-${index}`} className="flex items-start gap-1">
                <span className="mt-0.5">•</span>
                <span>{hint.message}</span>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              color="warning"
              variant="flat"
              startContent={<Edit className="w-3 h-3" />}
              onPress={handleImproveTask}
              className="font-semibold"
            >
              {t('taskHints.improveTask')}
            </Button>
            <Button
              size="sm"
              variant="light"
              onPress={onDismiss}
              className="text-yellow-700 hover:bg-yellow-100"
            >
              {t('taskHints.dismiss')}
            </Button>
          </div>
        </div>

        {/* X Close Button */}
        <button
          onClick={onDismiss}
          className="text-yellow-600 hover:text-yellow-800 transition-colors flex-shrink-0"
          aria-label="Close hint"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
