'use client'

import { MyApplication } from '../lib/types'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Avatar
} from '@heroui/react'
import { useParams } from 'next/navigation'
import {
  MapPin,
  Calendar,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Home,
  MessageCircle,
  Eye,
  Search,
  FileX,
  Star
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCityLabelBySlug } from '@/features/cities'
import { getTimelineLabel } from '@/lib/utils/timeline'

interface ApplicationDetailViewProps {
  application: MyApplication | null
  isOpen: boolean
  onClose: () => void
  onWithdraw?: (application: MyApplication) => void
  onMessageCustomer?: (application: MyApplication) => void
  onViewTask?: (application: MyApplication) => void
  onMarkCompleted?: (application: MyApplication) => void
  onFindSimilar?: (application: MyApplication) => void
  onDelete?: (application: MyApplication) => void
}

export default function ApplicationDetailView({
  application,
  isOpen,
  onClose,
  onWithdraw,
  onMessageCustomer,
  onViewTask,
  onMarkCompleted,
  onFindSimilar,
  onDelete
}: ApplicationDetailViewProps) {
  const t = useTranslations()
  const params = useParams()
  const currentLocale = (params?.lang as string) || 'bg'

  if (!application) return null

  const { task, customer, myProposal, status } = application

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />
      case 'rejected':
        return <XCircle className="w-5 h-5" />
      case 'withdrawn':
        return <FileX className="w-5 h-5" />
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: 'max-h-[90vh]',
        body: 'py-6'
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <h2 className="text-2xl font-bold">
                  {t(`myApplications.status.${status}`)}
                </h2>
              </div>
            </ModalHeader>

            <ModalBody>
              {/* Task Details Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t('myApplications.detail.taskDetails')}
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h4 className="text-xl font-bold">{task.title}</h4>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={customer.avatar}
                      name={customer.name}
                      size="sm"
                    />
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      {customer.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{customer.rating.toFixed(1)}</span>
                          {customer.reviewsCount && (
                            <span className="text-gray-500">({customer.reviewsCount})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info (only for accepted) */}
                  {status === 'accepted' && customer.phone && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                          {customer.phone}
                        </a>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                            {customer.email}
                          </a>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">{customer.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location and Budget */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{getCityLabelBySlug(task.location.city, t)}{task.location.neighborhood && `, ${task.location.neighborhood}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wallet className="w-4 h-4" />
                      <span>{task.budget.min}-{task.budget.max} {myProposal.currency}</span>
                    </div>
                  </div>

                  {task.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {t('myApplications.detail.completeBy', {
                          date: new Date(task.deadline).toLocaleDateString(currentLocale, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* Your Proposal / Agreed Terms */}
              <div className="my-6">
                <h3 className="text-lg font-semibold mb-3">
                  {status === 'accepted'
                    ? t('myApplications.detail.agreedTerms')
                    : t('myApplications.detail.yourProposal')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {status === 'accepted' ? t('myApplications.agreedPrice') : t('myApplications.yourQuote')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {myProposal.price} {myProposal.currency}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('applications.readyToStart')}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {getTimelineLabel(myProposal.timeline, t)}
                    </div>
                  </div>
                </div>

                {status === 'accepted' && application.startDate && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {t('myApplications.startDate')}: {new Date(application.startDate).toLocaleString(currentLocale, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1 font-medium">
                    {t('myApplications.detail.yourProposal')}:
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {myProposal.message}
                  </p>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {t('myApplications.appliedAgo', {
                    time: new Date(application.appliedAt).toLocaleString(currentLocale)
                  })}
                  {application.respondedAt && (
                    <>
                      {' • '}
                      {status === 'accepted' && t('myApplications.acceptedAgo', {
                        time: new Date(application.respondedAt).toLocaleString(currentLocale)
                      })}
                      {status === 'rejected' && t('myApplications.rejectedAgo', {
                        time: new Date(application.respondedAt).toLocaleString(currentLocale)
                      })}
                    </>
                  )}
                </div>
              </div>

              <Divider />

              {/* Status-Specific Content */}
              {status === 'pending' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-800 mb-1">
                        {t('myApplications.detail.waitingResponse')}
                      </div>
                      <p className="text-sm text-yellow-700">
                        {t('myApplications.detail.usuallyResponds')}
                      </p>
                      {application.otherApplicantsCount && application.otherApplicantsCount > 0 && (
                        <p className="text-sm text-yellow-700 mt-1">
                          {t('myApplications.detail.otherApplicants', {
                            count: application.otherApplicantsCount
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {status === 'accepted' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-semibold text-green-800 mb-2">
                    {t('myApplications.detail.nextSteps')}
                  </div>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{t('myApplications.detail.customerApproved')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 flex-shrink-0">•</span>
                      <span>{t('myApplications.detail.contactCustomer')}</span>
                    </li>
                    {task.deadline && (
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 flex-shrink-0">•</span>
                        <span>
                          {t('myApplications.detail.completeBy', {
                            date: new Date(task.deadline).toLocaleDateString(currentLocale, {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          })}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {status === 'rejected' && (
                <div className="mt-6 space-y-3">
                  {application.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-semibold text-red-800 mb-1">
                        {t('myApplications.detail.rejectionReason')}
                      </div>
                      <p className="text-red-700">"{application.rejectionReason}"</p>
                    </div>
                  )}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('myApplications.detail.feedback')}
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              {/* Actions based on status */}
              {status === 'pending' && (
                <>
                  <Button variant="light" onPress={onClose}>
                    {t('close')}
                  </Button>
                  <Button
                    variant="bordered"
                    startContent={<Eye className="w-4 h-4" />}
                    onPress={() => {
                      onViewTask?.(application)
                      onClose()
                    }}
                  >
                    {t('myApplications.viewTask')}
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<FileX className="w-4 h-4" />}
                    onPress={() => {
                      onWithdraw?.(application)
                      onClose()
                    }}
                  >
                    {t('myApplications.withdraw')}
                  </Button>
                </>
              )}

              {status === 'accepted' && (
                <>
                  <Button variant="light" onPress={onClose}>
                    {t('close')}
                  </Button>
                  <Button
                    color="primary"
                    startContent={<MessageCircle className="w-4 h-4" />}
                    onPress={() => {
                      onMessageCustomer?.(application)
                      onClose()
                    }}
                  >
                    {t('myApplications.messageCustomer')}
                  </Button>
                  <Button
                    color="success"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onPress={() => {
                      onMarkCompleted?.(application)
                      onClose()
                    }}
                  >
                    {t('myApplications.markCompleted')}
                  </Button>
                </>
              )}

              {status === 'rejected' && (
                <>
                  <Button variant="light" onPress={onClose}>
                    {t('close')}
                  </Button>
                  <Button
                    color="primary"
                    startContent={<Search className="w-4 h-4" />}
                    onPress={() => {
                      onFindSimilar?.(application)
                      onClose()
                    }}
                  >
                    {t('myApplications.findSimilar')}
                  </Button>
                </>
              )}

              {status === 'withdrawn' && (
                <>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      onDelete?.(application)
                      onClose()
                    }}
                  >
                    {t('myApplications.delete')}
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    {t('close')}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
