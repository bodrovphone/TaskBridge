'use client'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Avatar,
  Chip
} from '@nextui-org/react'
import { AlertTriangle, Star, User, FileText, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'next/navigation'
import type { PendingReviewTask, BlockType } from '../lib/types'

interface ReviewEnforcementDialogProps {
  isOpen: boolean
  onClose: () => void
  blockType: BlockType
  pendingTasks: PendingReviewTask[]
  onReviewTask: (taskId: string) => void
  onProceedToTaskCreation?: () => void // Called after all reviews done
}

export function ReviewEnforcementDialog({
  isOpen,
  onClose,
  blockType,
  pendingTasks,
  onReviewTask,
  onProceedToTaskCreation
}: ReviewEnforcementDialogProps) {
  const { t } = useTranslation()
  const params = useParams()
  const lang = (params?.lang as string) || 'bg'

  const isHardBlock = blockType === 'hard_block'
  const isSoftBlock = blockType === 'soft_block'

  const handleStartReviews = () => {
    // Redirect to pending reviews page with locale prefix
    window.location.href = `/${lang}/reviews/pending`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      isDismissable={!isHardBlock} // Hard block cannot be dismissed
      hideCloseButton={isHardBlock}
      classNames={{
        wrapper: 'z-[100]',
        backdrop: 'z-[99]',
        base: 'bg-white z-[100]',
        header: 'border-b border-gray-200',
        body: 'py-6',
        footer: 'border-t border-gray-200',
        closeButton: 'hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-700 text-xl sm:text-base mt-2 mr-2 sm:mt-0 sm:mr-0' // Larger on mobile
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* Header */}
            <ModalHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isHardBlock ? 'bg-danger-100' : 'bg-warning-100'
                }`}>
                  {isHardBlock ? (
                    <AlertTriangle className="w-6 h-6 text-danger" />
                  ) : (
                    <Star className="w-6 h-6 text-warning fill-warning" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isHardBlock
                      ? t('reviews.enforcement.hardBlock.title')
                      : t('reviews.enforcement.softBlock.title')}
                  </h3>
                  {isSoftBlock && (
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      {t('reviews.enforcement.softBlock.message', { count: 3 })}
                    </p>
                  )}
                </div>
              </div>
            </ModalHeader>

            {/* Body */}
            <ModalBody>
              <div className="space-y-4">
                {/* Hard Block Message */}
                {isHardBlock && (
                  <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                    <p className="text-sm text-danger-700 leading-relaxed">
                      {t('reviews.enforcement.hardBlock.message')}
                    </p>
                  </div>
                )}

                {/* Soft Block Message */}
                {isSoftBlock && (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {t('reviews.enforcement.softBlock.pleaseReview')}
                    </p>
                  </div>
                )}

                {/* Pending Reviews Count */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {t('reviews.enforcement.pendingCount', { count: pendingTasks.length })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('reviews.enforcement.helpProfessionals')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="gap-3 px-6 py-4">
              {isSoftBlock && (
                <Button
                  variant="flat"
                  onPress={onClose}
                  size="lg"
                  className="flex-1 font-semibold text-sm"
                >
                  {t('reviews.enforcement.softBlock.cancelButton')}
                </Button>
              )}
              <Button
                onPress={handleStartReviews}
                startContent={<Star className="w-4 h-4" />}
                size="lg"
                className={`flex-1 font-semibold text-sm ${
                  isHardBlock
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isHardBlock
                  ? t('reviews.enforcement.hardBlock.confirmButton')
                  : t('reviews.enforcement.softBlock.leaveReviewsButton')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
