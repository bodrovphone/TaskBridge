'use client'

import { MyApplication } from '../lib/types'
import { Card, CardBody, CardFooter, Chip, Button } from '@nextui-org/react'
import FallbackAvatar from '@/components/ui/fallback-avatar'
import {
  Clock,
  MapPin,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  FileX,
  Search
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { bg, enUS, ru } from 'date-fns/locale'
import { getCityLabelBySlug } from '@/features/cities'

interface MyApplicationCardProps {
  application: MyApplication
  onViewDetails: (application: MyApplication) => void
  onWithdraw?: (application: MyApplication) => void
  onMessageCustomer?: (application: MyApplication) => void
  onViewTask?: (application: MyApplication) => void
  onFindSimilar?: (application: MyApplication) => void
  onDelete?: (application: MyApplication) => void
}

export default function MyApplicationCard({
  application,
  onViewDetails,
  onWithdraw,
  onMessageCustomer,
  onViewTask,
  onFindSimilar,
  onDelete
}: MyApplicationCardProps) {
  const { t, i18n } = useTranslation()

  const getDateFnsLocale = () => {
    switch (i18n.language) {
      case 'bg':
        return bg
      case 'ru':
        return ru
      default:
        return enUS
    }
  }

  const getStatusColor = () => {
    switch (application.status) {
      case 'pending':
        return 'warning'
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'danger'
      case 'withdrawn':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = () => {
    switch (application.status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const timeAgo = formatDistanceToNow(
    application.status === 'accepted' && application.respondedAt
      ? application.respondedAt
      : application.status === 'rejected' && application.respondedAt
        ? application.respondedAt
        : application.appliedAt,
    { addSuffix: true, locale: getDateFnsLocale() }
  )

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody className="p-4">
        {/* Status and Time */}
        <div className="flex items-center justify-between mb-3">
          <Chip
            color={getStatusColor()}
            variant="flat"
            size="sm"
            startContent={getStatusIcon()}
          >
            {t(`myApplications.status.${application.status}`)}
          </Chip>
          <span className="text-xs text-gray-500">
            {application.status === 'accepted'
              ? t('myApplications.acceptedAgo', { time: timeAgo })
              : application.status === 'rejected'
                ? t('myApplications.rejectedAgo', { time: timeAgo })
                : t('myApplications.appliedAgo', { time: timeAgo })}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="text-lg font-bold mb-2 line-clamp-1">
          {application.task.title}
        </h3>

        {/* Customer and Location */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <FallbackAvatar
            src={application.customer.avatar}
            name={application.customer.name}
            size="sm"
            userId={application.customer.id}
          />
          <span className="font-medium">{application.customer.name}</span>
          {application.customer.rating && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                ⭐ {application.customer.rating.toFixed(1)}
              </span>
            </>
          )}
          <span>•</span>
          <MapPin className="w-3 h-3" />
          <span>{getCityLabelBySlug(application.task.location.city, t)}{application.task.location.neighborhood && `, ${application.task.location.neighborhood}`}</span>
        </div>

        {/* Proposal vs Budget */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-blue-700 mb-1">
              <Wallet className="w-3 h-3" />
              <span>{t('myApplications.yourQuote')}</span>
            </div>
            <div className="font-bold text-blue-900">
              {application.myProposal.price} {application.myProposal.currency}
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <Calendar className="w-3 h-3" />
              <span>{t('myApplications.timeline')}</span>
            </div>
            <div className="font-bold text-gray-900">
              {application.myProposal.timeline}
            </div>
          </div>
        </div>

        {/* Task Budget */}
        <div className="text-xs text-gray-500 mb-3">
          {t('myApplications.taskBudget')}: {application.task.budget.min}-{application.task.budget.max} {application.myProposal.currency}
        </div>

        {/* Category Tags */}
        <div className="flex gap-2 mb-3">
          <Chip size="sm" variant="bordered">
            {application.task.category}
          </Chip>
          {application.task.subcategory && (
            <Chip size="sm" variant="bordered">
              {application.task.subcategory}
            </Chip>
          )}
        </div>

        {/* Special Info for Accepted */}
        {application.status === 'accepted' && application.startDate && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {t('myApplications.startDate')}: {new Date(application.startDate).toLocaleString(i18n.language, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {application.status === 'rejected' && application.rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
            <div className="text-xs text-red-600 mb-1 font-medium">
              {t('myApplications.detail.rejectionReason')}:
            </div>
            <div className="text-sm text-red-800">
              "{application.rejectionReason}"
            </div>
          </div>
        )}
      </CardBody>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Action Buttons Based on Status */}
        {application.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => onViewDetails(application)}
              className="flex-1"
            >
              {t('myApplications.viewDetails')}
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<FileX className="w-4 h-4" />}
              onPress={() => onWithdraw?.(application)}
            >
              {t('myApplications.withdraw')}
            </Button>
          </>
        )}

        {application.status === 'accepted' && (
          <>
            <Button
              size="sm"
              color="primary"
              startContent={<MessageCircle className="w-4 h-4" />}
              onPress={() => onMessageCustomer?.(application)}
              className="flex-1"
            >
              {t('myApplications.messageCustomer')}
            </Button>
            <Button
              size="sm"
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => onViewTask?.(application)}
            >
              {t('myApplications.viewTask')}
            </Button>
          </>
        )}

        {application.status === 'rejected' && (
          <>
            <Button
              size="sm"
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => onViewDetails(application)}
              className="flex-1"
            >
              {t('myApplications.viewDetails')}
            </Button>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Search className="w-4 h-4" />}
              onPress={() => onFindSimilar?.(application)}
            >
              {t('myApplications.findSimilar')}
            </Button>
          </>
        )}

        {application.status === 'withdrawn' && (
          <>
            <Button
              size="sm"
              variant="bordered"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => onViewDetails(application)}
              className="flex-1"
            >
              {t('myApplications.viewDetails')}
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={() => onDelete?.(application)}
            >
              {t('myApplications.delete')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
