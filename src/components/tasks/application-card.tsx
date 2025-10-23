'use client'

import { Application } from '@/types/applications'
import { Card, CardBody, Button, Avatar, Chip } from '@nextui-org/react'
import { Star, CheckCircle, XCircle, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ApplicationCardProps {
  application: Application
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onViewDetails: (id: string) => void
}

export default function ApplicationCard({
  application,
  onAccept,
  onReject,
  onViewDetails
}: ApplicationCardProps) {
  const { t } = useTranslation()
  const { professional, proposedPrice, currency, timeline, message, status } = application

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'default'
      case 'pending':
      default:
        return 'warning'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return t('applications.filterAccepted', 'Accepted')
      case 'rejected':
        return t('applications.filterRejected', 'Rejected')
      case 'pending':
      default:
        return t('applications.filterPending', 'Pending')
    }
  }

  return (
    <Card
      className="w-full hover:shadow-lg transition-shadow duration-300"
      isPressable={false}
    >
      <CardBody className="p-6">
        {/* Professional Header */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar with Rating centered below */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <Avatar
                src={professional.avatar}
                name={professional.name}
                size="lg"
                className="flex-shrink-0"
              />
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm">{professional.rating}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{professional.name}</h3>
                {professional.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <div className="truncate">{t(professional.specializations[0])}</div>
                <div className="text-gray-500">{professional.completedTasks} {t('applications.tasksCompleted', 'tasks completed')}</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-end">
            <Chip
              color={getStatusColor(status)}
              variant="flat"
              size="sm"
            >
              {getStatusLabel(status)}
            </Chip>
          </div>
        </div>

        {/* Application Message */}
        <p className="text-gray-700 mb-4 line-clamp-2">
          "{message}"
        </p>

        {/* Price & Timeline */}
        <div className="flex items-center gap-6 mb-4 pb-4 border-b">
          <div>
            <div className="text-sm text-gray-500">{t('applications.proposedPrice', 'Price')}</div>
            <div className="font-bold text-lg text-blue-600">
              {proposedPrice} {currency}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('applications.timeline', 'Timeline')}</div>
            <div className="font-semibold">{timeline}</div>
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {professional.specializations.map((spec, index) => (
            <Chip key={index} variant="flat" size="sm" color="primary">
              {t(spec)}
            </Chip>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {status === 'pending' ? (
            <>
              <div className="flex gap-2">
                <Button
                  color="success"
                  variant="flat"
                  startContent={<CheckCircle className="w-4 h-4" />}
                  onPress={() => onAccept(application.id)}
                  className="flex-1"
                >
                  {t('applications.acceptApplication', 'Accept')}
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<XCircle className="w-4 h-4" />}
                  onPress={() => onReject(application.id)}
                  className="flex-1"
                >
                  {t('applications.rejectApplication', 'Reject')}
                </Button>
              </div>
              <Button
                variant="bordered"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => onViewDetails(application.id)}
                className="w-full"
              >
                {t('applications.viewDetails', 'View Details')}
              </Button>
            </>
          ) : (
            <Button
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => onViewDetails(application.id)}
              className="w-full"
            >
              {t('applications.viewDetails', 'View Details')}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
