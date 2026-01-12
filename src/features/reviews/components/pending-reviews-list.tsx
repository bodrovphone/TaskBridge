'use client'

import { Card, CardBody, Button, Avatar, Skeleton, Chip } from '@heroui/react'
import { Star, Calendar, User, FileText, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()

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
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
            <Star className="w-12 h-12 text-green-600 fill-green-600" />
          </div>
          {/* Decorative stars */}
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 absolute -bottom-1 -left-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="w-5 h-5 text-blue-400 absolute top-2 -left-3 animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {t('reviews.pending.empty')}
        </h3>
        <p className="text-base text-gray-600 max-w-md">
          {t('reviews.pending.emptyMessage')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stars decoration */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 mb-6 text-center sm:text-left">
        <div className="hidden sm:flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 sm:hidden text-yellow-400 fill-yellow-400" />
          <h3 className="text-xl sm:text-lg font-bold sm:font-semibold text-gray-900">
            {t('reviews.pending.title')}
          </h3>
          <Star className="w-6 h-6 sm:hidden text-yellow-400 fill-yellow-400" />
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>

      {/* Task List */}
      {tasks.map((task) => (
          <Card
            key={task.id}
            className="border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-yellow-50/30"
          >
            <CardBody className="p-5">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Avatar with star badge */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    name={task.professionalName}
                    src={task.professionalAvatar}
                    size="lg"
                    className="ring-2 ring-yellow-300"
                  />
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 w-full sm:w-auto space-y-2">
                  {/* Task Title */}
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <h4 className="font-bold text-gray-900 leading-tight text-lg">
                      {task.title}
                    </h4>
                  </div>

                  {/* Professional Name with chip */}
                  <div className="flex items-center gap-2">
                    <Chip
                      startContent={<User className="w-4 h-4" />}
                      variant="flat"
                      color="primary"
                      size="md"
                      classNames={{
                        base: "bg-blue-100",
                        content: "text-blue-900 font-semibold"
                      }}
                    >
                      {task.professionalName}
                    </Chip>
                  </div>

                  {/* Completion Date with badge */}
                  <div className="flex items-center gap-2">
                    <Chip
                      startContent={<Calendar className="w-3 h-3" />}
                      variant="flat"
                      color="success"
                      size="sm"
                    >
                      {formatDaysAgo(task.daysAgo)}
                    </Chip>
                  </div>
                </div>

                {/* Action Button - PROMINENT */}
                <div className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center">
                  <Button
                    color="warning"
                    variant="shadow"
                    size="lg"
                    onPress={() => onReviewTask(task.id)}
                    className="w-full sm:w-auto font-bold"
                    startContent={<Star className="w-5 h-5 fill-current" />}
                  >
                    {t('reviews.pending.leaveReviewButton')}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
      ))}
    </div>
  )
}
