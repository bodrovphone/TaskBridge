'use client'

import { Application } from '@/types/applications'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Chip,
  Divider
} from '@heroui/react'
import { Star, CheckCircle, XCircle, Wallet, Award, BadgeCheck, Clock, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { getTimelineLabel } from '@/lib/utils/timeline'

interface ApplicationDetailProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
}

export default function ApplicationDetail({
  application,
  isOpen,
  onClose,
  onAccept,
  onReject
}: ApplicationDetailProps) {
  const t = useTranslations()
  const params = useParams()
  const currentLang = (params?.lang as string) || 'bg'
  const [selectedImage, setSelectedImage] = useState(0)

  if (!application) return null

  const { professional, proposedPrice, currency, timeline, message, portfolioImages, status } = application

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
              <h2 className="text-2xl font-bold">{t('applicationDetail.title')}</h2>
            </ModalHeader>

            <ModalBody>
              {/* Professional Profile Section */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                {/* Mobile: 2-column layout, Desktop: horizontal layout */}
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-start gap-4">
                  {/* Left Column (Mobile) / Avatar (Desktop) */}
                  <div className="flex flex-col gap-3 items-center">
                    {/* Name */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="text-lg sm:text-xl font-bold text-center">
                        {professional.name}
                      </span>
                      {professional.verified && (
                        <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      src={professional.avatar || undefined}
                      name={professional.name}
                      className="w-20 h-20 flex-shrink-0"
                    />

                    {/* Rating - centered under avatar */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <span className="font-semibold text-sm">{professional.rating}</span>
                    </div>
                  </div>

                  {/* Right Column (Mobile) / Content (Desktop) */}
                  <div className="flex flex-col gap-3 sm:flex-1">
                    {/* Tasks Completed */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{professional.completedTasks} {t('applications.tasksCompleted')}</span>
                    </div>

                    {/* Years of Experience */}
                    {professional.yearsOfExperience && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>{professional.yearsOfExperience} {t('applications.yearsExperience')}</span>
                      </div>
                    )}

                    {/* Skills/Categories */}
                    <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                      {professional.skills?.map((skill, index) => (
                        <div
                          key={index}
                          className="bg-white text-gray-900 font-medium text-xs px-2 py-1 rounded-full max-w-[120px] truncate"
                        >
                          {t(skill)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Profile Button - full width at bottom */}
                <Button
                  as="a"
                  href={`/${currentLang}/professionals/${professional.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="bordered"
                  color="primary"
                  startContent={<ExternalLink className="w-4 h-4" />}
                  className="w-full mt-4 bg-white"
                >
                  {t('applications.viewProfile')}
                </Button>
              </div>

              <Divider className="my-4" />

              {/* Price & Timeline - Highlighted */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('applications.proposedPrice')}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {proposedPrice} {currency}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('applications.readyToStart')}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{getTimelineLabel(timeline, t)}</div>
                </div>
              </div>

              {/* Application Message */}
              <div>
                <h4 className="font-semibold text-lg mb-2">{t('applicationDetail.applicationMessage')}</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Portfolio Gallery */}
              {portfolioImages && portfolioImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-lg mb-3">{t('applicationDetail.portfolioGallery')}</h4>
                  <div className="space-y-3">
                    {/* Main Image */}
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={portfolioImages[selectedImage]}
                        alt={`Portfolio ${selectedImage + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Thumbnails */}
                    {portfolioImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {portfolioImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                              selectedImage === index
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Reviews */}
              {professional.reviews && professional.reviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-lg mb-3">{t('applicationDetail.recentReviews')}</h4>
                  <div className="space-y-3">
                    {professional.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={review.reviewerAvatar}
                            name={review.reviewerName}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">
                                {review.reviewerName}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold">{review.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{review.taskCategory}</span>
                              <span>•</span>
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-6">
                <Chip
                  color={
                    status === 'accepted' ? 'success' :
                    status === 'rejected' || status === 'withdrawn' ? 'default' :
                    status === 'removed_by_customer' ? 'danger' :
                    'warning'
                  }
                  variant="flat"
                  size="lg"
                >
                  {t('applications.status')}: {t(`applications.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                </Chip>
              </div>
            </ModalBody>

            <ModalFooter>
              {status === 'pending' ? (
                <>
                  <Button variant="bordered" onPress={onClose}>
                    {t('applicationDetail.close')}
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<XCircle className="w-4 h-4" />}
                    onPress={() => onReject(application.id)}
                  >
                    {t('applications.rejectApplication')}
                  </Button>
                  <Button
                    color="success"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onPress={() => onAccept(application.id)}
                  >
                    {t('applications.acceptApplication')}
                  </Button>
                </>
              ) : (
                <Button variant="bordered" onPress={onClose}>
                  {t('applicationDetail.close')}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
