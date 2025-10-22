'use client'

import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip } from '@nextui-org/react'
import { Banknote, MapPin, Calendar, Users, Eye, FileText } from 'lucide-react'

interface PostedTaskCardProps {
  id: string
  title: string
  description: string
  category: string
  budget: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  applicationsCount: number
  acceptedApplication?: {
    professionalId: string
    professionalName: string
  }
  location: {
    city: string
    neighborhood: string
  }
  createdAt: Date
  lang: string
}

function PostedTaskCard({
  id,
  title,
  description,
  category,
  budget,
  status,
  applicationsCount,
  acceptedApplication,
  location,
  createdAt,
  lang
}: PostedTaskCardProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const getStatusColor = (taskStatus: typeof status) => {
    switch (taskStatus) {
      case 'open':
        return 'primary'
      case 'in_progress':
        return 'warning'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (taskStatus: typeof status) => {
    switch (taskStatus) {
      case 'open':
        return t('postedTasks.filter.open')
      case 'in_progress':
        return t('postedTasks.filter.inProgress')
      case 'completed':
        return t('postedTasks.filter.completed')
      case 'cancelled':
        return t('postedTasks.filter.cancelled')
      default:
        return taskStatus
    }
  }

  return (
    <Card
      isPressable
      onPress={() => router.push(`/${lang}/tasks/${id}`)}
      className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] h-full flex flex-col"
    >
      <CardBody className="p-6 flex flex-col h-full">
        {/* Header with title and status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
            {title}
          </h3>
          <Chip
            color={getStatusColor(status)}
            variant="flat"
            size="sm"
            className="flex-shrink-0"
          >
            {getStatusLabel(status)}
          </Chip>
        </div>

        {/* Category chip */}
        <div className="mb-3">
          <Chip size="sm" variant="bordered" className="text-xs">
            {t(category)}
          </Chip>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
          {description}
        </p>

        {/* Task details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-700">{budget} лв</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{location.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-primary">
              {t('postedTasks.applicationsCount', { count: applicationsCount })}
            </span>
          </div>
        </div>

        {/* Accepted professional banner - fixed height with min-h to prevent layout shift */}
        <div className="min-h-[52px] mb-4">
          {acceptedApplication && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <span className="font-semibold">{t('postedTasks.acceptedProfessional')}:</span>{' '}
                {acceptedApplication.professionalName}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Eye className="w-4 h-4" />}
            onPress={() => router.push(`/${lang}/tasks/${id}`)}
            className="flex-1"
          >
            {t('postedTasks.viewDetails')}
          </Button>
          {applicationsCount > 0 && (
            <Button
              size="sm"
              variant="bordered"
              color="primary"
              startContent={<FileText className="w-4 h-4" />}
              onPress={() => router.push(`/${lang}/tasks/${id}#applications`)}
              className="flex-1"
            >
              {t('postedTasks.viewApplications')} ({applicationsCount})
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

PostedTaskCard.displayName = 'PostedTaskCard'

export default PostedTaskCard
