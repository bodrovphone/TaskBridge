'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { createTaskSchema, defaultFormValues, type CreateTaskFormData } from '../lib/validation'
import { CategorySelection } from './category-selection'
import { TaskDetailsSection } from './task-details-section'
import { LocationSection } from './location-section'
import { BudgetSection } from './budget-section'
import { TimelineSection } from './timeline-section'
import { PhotosSection } from './photos-section'
import { ReviewSection } from './review-section'

export function CreateTaskForm() {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  })

  const {
    handleSubmit,
    formState: { errors, isValid, isValidating },
    watch,
  } = form

  // Debug: Log form state
  console.log('Form validity:', { isValid, isValidating, errors })

  // Watch form values for conditional rendering
  const category = watch('category')
  const budgetType = watch('budgetType')
  const urgency = watch('urgency')

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      setIsSubmitting(true)
      console.log('Form data:', data)

      // TODO: Implement API call
      // const response = await fetch('/api/tasks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })

      // if (!response.ok) throw new Error('Failed to create task')

      // const result = await response.json()
      // router.push(`/${locale}/tasks/${result.task.id}`)

      // Temporary: Just log the data
      alert('Task created successfully! (Mock)')
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Category Selection */}
      <CategorySelection form={form} />

      {/* Show remaining sections only after category is selected */}
      {category && (
        <>
          {/* Task Details */}
          <TaskDetailsSection form={form} />

          {/* Location */}
          <LocationSection form={form} />

          {/* Budget */}
          <BudgetSection form={form} budgetType={budgetType} />

          {/* Timeline */}
          <TimelineSection form={form} urgency={urgency} />

          {/* Photos */}
          <PhotosSection form={form} />

          {/* Review & Submit */}
          <ReviewSection form={form} />

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-3 pt-8 pb-4">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className={`min-w-[300px] h-16 font-bold text-xl transition-all duration-300 ${
                Object.keys(errors).length > 0
                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600'
                  : 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 shadow-xl hover:shadow-green-500/50 hover:scale-105'
              }`}
              radius="lg"
            >
              {isSubmitting ? t('loading', 'Loading...') : t('createTask.review.submit')}
            </Button>
            {Object.keys(errors).length > 0 && (
              <div className="flex flex-col gap-1 items-center">
                <p className="text-sm font-semibold text-orange-600 text-center">
                  ⚠️ {t('createTask.review.fillRequired', 'Please fill in all required fields to submit')}
                </p>
                <div className="text-xs text-gray-600 text-center">
                  {Object.entries(errors).map(([field, error]) => (
                    <div key={field}>
                      • {t((error as any)?.message || 'Error in ' + field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </form>
  )
}
