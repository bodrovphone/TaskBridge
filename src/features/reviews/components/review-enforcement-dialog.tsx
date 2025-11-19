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

  const isHardBlock = blockType === 'hard_block'
  const isSoftBlock = blockType === 'soft_block'

  const handleStartReviews = () => {
    if (pendingTasks.length > 0) {
      onReviewTask(pendingTasks[0].id)
    }
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
        footer: 'border-t border-gray-200'
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* Header */}
            <ModalHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isHardBlock ? 'bg-danger-100' : 'bg-warning-100'
                }`}>
                  {isHardBlock ? (
                    <AlertTriangle className="w-6 h-6 text-danger" />
                  ) : (
                    <Star className="w-6 h-6 text-warning" />
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

                {/* Pending Tasks List */}
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => (
                    <Card
                      key={task.id}
                      className="border border-gray-200"
                    >
                      <CardBody className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Task Number Badge */}
                          <div className="flex-shrink-0">
                            <Chip
                              size="sm"
                              variant="flat"
                              color="primary"
                              className="font-semibold"
                            >
                              {index + 1}
                            </Chip>
                          </div>

                          {/* Avatar */}
                          <Avatar
                            name={task.professionalName}
                            src={task.professionalAvatar}
                            size="md"
                            classNames={{
                              base: 'flex-shrink-0'
                            }}
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Task Title */}
                            <div className="flex items-start gap-2 mb-1">
                              <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                              <h4 className="font-semibold text-gray-900 leading-tight text-sm">
                                {task.title}
                              </h4>
                            </div>

                            {/* Professional Name */}
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span>{task.professionalName}</span>
                            </div>

                            {/* Days Ago */}
                            <div className="text-xs text-gray-500 mt-1">
                              {t('reviews.pending.completedDaysAgo', { count: task.daysAgo })}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* Progress indicator if multiple tasks */}
                {pendingTasks.length > 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {t('reviews.progress.multipleReviews', { count: pendingTasks.length })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            {/* Footer */}
            <ModalFooter>
              {isSoftBlock && (
                <Button
                  variant="light"
                  onPress={onClose}
                >
                  {t('reviews.enforcement.softBlock.cancelButton')}
                </Button>
              )}
              <Button
                color={isHardBlock ? 'danger' : 'primary'}
                onPress={handleStartReviews}
                startContent={<Star className="w-4 h-4" />}
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
