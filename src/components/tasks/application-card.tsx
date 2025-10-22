'use client'

import { Application } from '@/types/applications'
import { Card, CardBody, Button, Avatar, Chip } from '@heroui/react'
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={professional.avatar}
              name={professional.name}
              size="lg"
              className="flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{professional.name}</h3>
                {professional.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{t(professional.specializations[0])}</span>
                <span>•</span>
                <span>{professional.completedTasks} {t('applications.tasksCompleted', 'tasks completed')}</span>
              </div>
            </div>
          </div>

          {/* Rating & Status */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{professional.rating}</span>
            </div>
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
        <div className="flex gap-2">
          {status === 'pending' ? (
            <>
              <Button
                color="success"
                variant="flat"
                startContent={<CheckCircle className="w-4 h-4" />}
                onClick={() => onAccept(application.id)}
                className="flex-1"
              >
                {t('applications.acceptApplication', 'Accept')}
              </Button>
              <Button
                color="danger"
                variant="flat"
                startContent={<XCircle className="w-4 h-4" />}
                onClick={() => onReject(application.id)}
                className="flex-1"
              >
                {t('applications.rejectApplication', 'Reject')}
              </Button>
            </>
          ) : null}
          <Button
            variant="bordered"
            startContent={<Eye className="w-4 h-4" />}
            onClick={() => onViewDetails(application.id)}
            className={status === 'pending' ? '' : 'flex-1'}
          >
            {t('applications.viewDetails', 'View Details')}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
