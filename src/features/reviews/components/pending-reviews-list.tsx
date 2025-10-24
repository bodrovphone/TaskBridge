'use client'

import { Card, CardBody, Button, Avatar, Skeleton } from '@nextui-org/react'
import { Star, Calendar, User, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PendingReviewTask } from '../lib/types'

interface PendingReviewsListProps {
  tasks: PendingReviewTask[]
  onReviewTask: (taskId: string) => void
  isLoading?: boolean
}

export function PendingReviewsList({
  tasks,
  onReviewTask,
  isLoading = false
}: PendingReviewsListProps) {
  const { t } = useTranslation()

  const formatDaysAgo = (daysAgo: number) => {
    if (daysAgo === 0) return t('common.today')
    if (daysAgo === 1) return t('common.yesterday')
    if (daysAgo < 7) return t('reviews.pending.completedDaysAgo', { count: daysAgo })
    if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7)
      return t('reviews.pending.completedWeeksAgo', { count: weeks })
    }
    const months = Math.floor(daysAgo / 30)
    return t('reviews.pending.completedMonthsAgo', { count: months })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
                <Skeleton className="h-10 w-28 rounded" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-green-600 fill-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('reviews.pending.empty')}
        </h3>
        <p className="text-sm text-gray-600 max-w-sm">
          {t('reviews.pending.emptyMessage')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('reviews.pending.title', { count: tasks.length })}
        </h3>
      </div>

      {/* Task List */}
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-200"
        >
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              {/* Avatar */}
              <Avatar
                name={task.professionalName}
                src={task.professionalAvatar}
                size="lg"
                classNames={{
                  base: 'flex-shrink-0'
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                {/* Task Title */}
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-900 leading-tight">
                    {task.title}
                  </h4>
                </div>

                {/* Professional Name */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>{task.professionalName}</span>
                </div>

                {/* Completion Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDaysAgo(task.daysAgo)}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                color="primary"
                variant="flat"
                onPress={() => onReviewTask(task.id)}
                className="w-full sm:w-auto flex-shrink-0"
                startContent={<Star className="w-4 h-4" />}
              >
                {t('reviews.pending.leaveReviewButton')}
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
