'use client'

import { useTranslation } from 'react-i18next'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react'
import { AlertTriangle, XCircle } from 'lucide-react'

interface CancelTaskConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  taskTitle: string
  applicationsCount: number
  isLoading?: boolean
}

export function CancelTaskConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  applicationsCount,
  isLoading = false
}: CancelTaskConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      classNames={{
        base: 'bg-white',
        backdrop: 'bg-black/80',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-6 h-6" />
            <span>{t('taskDetail.cancelDialog.title')}</span>
          </div>
          <p className="text-sm font-normal text-gray-600">
            {taskTitle}
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-900 mb-2">
              {t('taskDetail.cancelDialog.warning')}
            </p>
            <ul className="text-sm text-red-800 space-y-1.5 ml-4">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  {applicationsCount > 0 ? (
                    <>
                      {t('taskDetail.cancelDialog.consequence1')}
                      <strong className="ml-1">
                        ({applicationsCount} {applicationsCount === 1 ? t('common.application', 'application') : t('common.applications', 'applications')})
                      </strong>
                    </>
                  ) : (
                    t('taskDetail.cancelDialog.consequence1NoApps')
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t('taskDetail.cancelDialog.consequence2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t('taskDetail.cancelDialog.consequence3')}</span>
              </li>
            </ul>
          </div>

          {/* Confirmation Question */}
          <p className="text-sm text-gray-700 font-medium">
            {t('taskDetail.cancelDialog.confirm')}
          </p>
        </ModalBody>

        <ModalFooter className="gap-2">
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
          >
            {t('taskDetail.cancelDialog.btnCancel')}
          </Button>
          <Button
            color="danger"
            onPress={onConfirm}
            isLoading={isLoading}
            startContent={!isLoading && <XCircle className="w-4 h-4" />}
          >
            {isLoading ? t('taskDetail.cancelDialog.processing') : t('taskDetail.cancelDialog.btnConfirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
