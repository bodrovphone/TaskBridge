'use client'

import { Card, CardBody } from '@heroui/react'
import { PlayCircle, CheckCircle, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TimelineEvent {
  label: string
  date?: Date
  completed: boolean
}

interface CompletionTimelineProps {
  startedAt: Date
  professionalMarkedAt?: Date
  customerConfirmedAt?: Date
  completedAt?: Date
  className?: string
}

export function CompletionTimeline({
  startedAt,
  professionalMarkedAt,
  customerConfirmedAt,
  completedAt,
  className = ''
}: CompletionTimelineProps) {
  const { t } = useTranslation()

  const events: TimelineEvent[] = [
    {
      label: t('taskCompletion.timeline.started'),
      date: startedAt,
      completed: true
    },
    {
      label: t('taskCompletion.timeline.proMarked'),
      date: professionalMarkedAt,
      completed: !!professionalMarkedAt
    },
    {
      label: t('taskCompletion.timeline.customerConfirmed'),
      date: customerConfirmedAt,
      completed: !!customerConfirmedAt
    },
    {
      label: t('taskCompletion.timeline.completed'),
      date: completedAt,
      completed: !!completedAt
    }
  ]

  const formatDate = (date?: Date) => {
    if (!date) return '—'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardBody className="p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          {t('taskCompletion.timeline.title')}
        </h3>

        <div className="space-y-6">
          {events.map((event, index) => {
            const isLast = index === events.length - 1
            const Icon = event.completed
              ? CheckCircle
              : index === 0
              ? PlayCircle
              : Clock

            return (
              <div key={index} className="relative">
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%+8px)] ${
                      event.completed && events[index + 1]?.completed
                        ? 'bg-success'
                        : 'bg-gray-300'
                    }`}
                  />
                )}

                {/* Timeline Event */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full flex-shrink-0 z-10 ${
                      event.completed
                        ? 'bg-success text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between gap-4">
                      <p
                        className={`font-medium ${
                          event.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {event.label}
                      </p>
                      <p
                        className={`text-sm flex-shrink-0 ${
                          event.completed ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {formatDate(event.date)}
                      </p>
                    </div>

                    {/* Progress indicator for pending events */}
                    {!event.completed && index > 0 && events[index - 1]?.completed && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-warning rounded-full animate-pulse" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {t('taskCompletion.timeline.pending')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        {completedAt && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('taskCompletion.timeline.totalDuration')}</span>
              <span className="font-semibold text-gray-900">
                {Math.ceil((completedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24))} {t('common.days')}
              </span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
