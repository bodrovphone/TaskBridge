'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, Chip, Divider } from '@nextui-org/react'
import { MapPin, Wallet, Clock, FileText } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { CreateTaskFormData, TASK_CATEGORIES } from '../lib/validation'
import Image from 'next/image'

interface ReviewSectionProps {
  form: UseFormReturn<CreateTaskFormData>
}

export function ReviewSection({ form }: ReviewSectionProps) {
  const { t } = useTranslation()
  const { watch } = form

  const formData = watch()

  // Get category info
  const categoryInfo = TASK_CATEGORIES.find(cat => cat.value === formData.category)

  // Format budget display
  const getBudgetDisplay = () => {
    if (formData.budgetType === 'fixed' && formData.budgetMax) {
      return `${formData.budgetMax} лв`
    } else if (formData.budgetMin && formData.budgetMax) {
      return `${formData.budgetMin}-${formData.budgetMax} лв`
    } else if (formData.budgetMin) {
      return `${t('taskCard.budget.from')} ${formData.budgetMin} лв`
    } else if (formData.budgetMax) {
      return `${t('taskCard.budget.to')} ${formData.budgetMax} лв`
    }
    return t('taskCard.budget.negotiable')
  }

  // Format deadline display
  const getDeadlineDisplay = () => {
    if (formData.deadline) {
      return new Date(formData.deadline).toLocaleDateString()
    }
    if (formData.urgency === 'same_day') return t('createTask.timeline.urgentTitle')
    if (formData.urgency === 'within_week') return t('createTask.timeline.soonTitle')
    return t('createTask.timeline.flexibleTitle')
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('createTask.review.title', 'Review your task')}
        </h2>
        <p className="text-gray-600">
          {t('createTask.review.subtitle', 'Make sure everything looks good before posting')}
        </p>
      </div>

      <Card>
        <CardBody className="p-6 space-y-6">
          {/* Category & Title */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {categoryInfo && (
                <Chip size="sm" variant="flat" color="primary">
                  {categoryInfo.icon} {t(categoryInfo.labelKey)}
                </Chip>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {formData.title || t('createTask.review.noTitle', 'No title yet')}
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {formData.description || t('createTask.review.noDescription', 'No description yet')}
            </p>
          </div>

          <Divider />

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h4 className="font-semibold text-gray-900">
                {t('createTask.review.location', 'Location')}
              </h4>
            </div>
            <p className="text-gray-600 ml-7">
              {formData.city || t('createTask.review.noCity', 'No city selected')}
              {formData.neighborhood && `, ${formData.neighborhood}`}
            </p>
            {formData.exactAddress && (
              <p className="text-sm text-gray-500 ml-7 mt-1">
                {t('createTask.location.addressSecurity', 'Full address hidden until professional is hired')}
              </p>
            )}
          </div>

          <Divider />

          {/* Budget */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-gray-400" />
              <h4 className="font-semibold text-gray-900">
                {t('createTask.review.budget', 'Budget')}
              </h4>
            </div>
            <p className="text-gray-600 ml-7">{getBudgetDisplay()}</p>
          </div>

          <Divider />

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h4 className="font-semibold text-gray-900">
                {t('createTask.review.timeline', 'Timeline')}
              </h4>
            </div>
            <p className="text-gray-600 ml-7">{getDeadlineDisplay()}</p>
          </div>

          {/* Requirements */}
          {formData.requirements && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-900">
                    {t('createTask.review.requirements', 'Requirements')}
                  </h4>
                </div>
                <p className="text-gray-600 ml-7 whitespace-pre-wrap">
                  {formData.requirements}
                </p>
              </div>
            </>
          )}

          {/* Photos */}
          {formData.photos && formData.photos.length > 0 && (
            <>
              <Divider />
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {t('createTask.review.photos', 'Photos')} ({formData.photos.length})
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {formData.photos.map((photoUrl, index) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={photoUrl}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
