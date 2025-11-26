'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Card,
  CardBody,
  Divider
} from '@nextui-org/react'
import { CheckCircle, User, Banknote } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MarkCompletedDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: CompletionData) => void
  taskTitle: string
  customerName: string
  payment: string
  isLoading?: boolean
}

interface CompletionData {
  requirementsCompleted: boolean
}

export function MarkCompletedDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  customerName,
  payment,
  isLoading = false
}: MarkCompletedDialogProps) {
  const { t } = useTranslation()
  const [requirementsCompleted, setRequirementsCompleted] = useState(false)

  const canSubmit = requirementsCompleted

  const handleConfirm = () => {
    if (!canSubmit) return

    onConfirm({
      requirementsCompleted
    })
  }

  const handleClose = () => {
    // Reset form
    setRequirementsCompleted(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        wrapper: 'overflow-x-hidden',
        base: 'bg-white max-h-[95vh] md:max-h-[90vh] mx-2 md:mx-auto w-full',
        header: 'border-b border-gray-200',
        body: 'max-h-[calc(95vh-140px)] md:max-h-none overflow-x-hidden',
        footer: 'border-t border-gray-200'
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span>{t('taskCompletion.markDialog.title')}</span>
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Task Summary */}
          <Card className="shadow-sm bg-gray-50">
            <CardBody className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.markDialog.task')}</p>
                  <p className="font-semibold text-gray-900">{taskTitle}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.markDialog.customer')}</p>
                  <p className="font-semibold text-gray-900">{customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.markDialog.payment')}</p>
                  <p className="font-semibold text-gray-900">{payment}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Divider className="my-4" />

          {/* Completion Checklist */}
          <div className="space-y-4">
            <p className="font-medium text-gray-900">
              {t('taskCompletion.markDialog.question')}
            </p>

            <div className="flex flex-col gap-3">
              <Checkbox
                isSelected={requirementsCompleted}
                onValueChange={setRequirementsCompleted}
                classNames={{
                  wrapper: 'after:bg-success after:text-white'
                }}
              >
                <span className="text-sm">{t('taskCompletion.markDialog.checkRequirements')}</span>
              </Checkbox>
            </div>
          </div>

        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            isDisabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            color="success"
            startContent={<CheckCircle className="w-4 h-4" />}
            onPress={handleConfirm}
            isDisabled={!canSubmit}
            isLoading={isLoading}
          >
            {t('taskCompletion.markCompleted')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
