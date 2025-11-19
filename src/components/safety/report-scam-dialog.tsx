'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { AlertTriangle, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ReportScamDialogProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  relatedTaskId?: string
}

const REPORT_TYPES = [
  'fraud_scam',
  'threatening_behavior',
  'harassment',
  'identity_theft',
  'poor_quality',
  'no_show',
  'other',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export function ReportScamDialog({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  relatedTaskId,
}: ReportScamDialogProps) {
  const { t } = useTranslation()
  const [reportType, setReportType] = useState<ReportType>('fraud_scam')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validate description
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // @todo FEATURE: Get actual current user ID from auth context
      const currentUserId = 'current-user-id' // Placeholder - replace with actual auth

      const response = await fetch('/api/safety/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterId: currentUserId,
          reportedUserId,
          reportType,
          description,
          evidenceUrls: [], // @todo FEATURE: Add actual uploaded files
          relatedTaskId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      // Reset form
      setDescription('')
      setReportType('fraud_scam')

      // Close dialog
      onClose()

      // Show success message
      // @todo FEATURE: Replace alert with proper toast notification
      if (data.suspended) {
        alert(`${t('report.successMessage')}\n\nNote: This user has been automatically suspended due to multiple reports.`)
      } else {
        alert(t('report.successMessage'))
      }

      // @todo FEATURE: Refresh the page to show updated suspension state
      // window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('report.errorMessage'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setDescription('')
    setReportType('fraud_scam')
    setError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 pb-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <div>
                <h2 className="text-lg font-semibold">
                  {t('report.dialogTitle')}
                </h2>
                <p className="text-sm font-normal text-default-500 mt-1">
                  {t('report.dialogDescription')}
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="py-4">
              {/* Report Type Selection */}
              <div className="space-y-4">
                <Select
                  label={t('report.typeLabel')}
                  placeholder="Select issue type"
                  selectedKeys={[reportType]}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  isRequired
                >
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`report.type.${type}`)}
                    </SelectItem>
                  ))}
                </Select>

                {/* Description */}
                <Textarea
                  label={t('report.descriptionLabel')}
                  placeholder={t('report.descriptionPlaceholder')}
                  value={description}
                  onValueChange={setDescription}
                  minRows={4}
                  maxRows={8}
                  isRequired
                  isInvalid={!!error}
                  errorMessage={error}
                  classNames={{
                    input: 'text-base' // 16px font size prevents iOS zoom
                  }}
                />

                {/* Evidence Upload (Future Feature) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-default-700">
                    {t('report.evidenceLabel')}
                  </label>
                  <div className="border-2 border-dashed border-default-300 rounded-lg p-6 text-center hover:border-default-400 transition-colors cursor-not-allowed opacity-50">
                    <Upload className="w-8 h-8 text-default-400 mx-auto mb-2" />
                    <p className="text-sm text-default-500">
                      {t('report.evidenceHint')}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      {t('report.evidenceComingSoon')}
                    </p>
                  </div>
                </div>

                {/* Additional Context */}
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <p className="text-xs text-warning-800">
                    <strong>{t('common.important')}:</strong> {t('report.falseReportWarning')}
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={handleClose}
                isDisabled={isSubmitting}
              >
                {t('report.cancelButton')}
              </Button>
              <Button
                color="danger"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!description.trim()}
              >
                {t('report.submitButton')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
