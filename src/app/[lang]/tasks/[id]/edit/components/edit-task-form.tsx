'use client'

import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { useRouter, useParams } from 'next/navigation'
import { CategorySelection } from '@/app/[lang]/create-task/components/category-selection'
import { TaskDetailsSection } from '@/app/[lang]/create-task/components/task-details-section'
import { LocationSection } from '@/app/[lang]/create-task/components/location-section'
import { BudgetSection } from '@/app/[lang]/create-task/components/budget-section'
import { TimelineSection } from '@/app/[lang]/create-task/components/timeline-section'
import { PhotosSection } from '@/app/[lang]/create-task/components/photos-section'
import { ReviewSection } from '@/app/[lang]/create-task/components/review-section'
import { useToast } from '@/hooks/use-toast'
import { CategoryDisplay } from './category-display'

interface EditTaskFormProps {
  taskData: {
    id: string
    title: string
    description: string
    category: string
    subcategory?: string
    city: string
    neighborhood?: string
    exactAddress?: string
    budgetType: 'fixed' | 'range'
    budgetMin?: number | null
    budgetMax?: number | null
    urgency: 'same_day' | 'within_week' | 'flexible'
    deadline?: Date
    photos?: string[]
    requirements?: string
  }
}

export function EditTaskForm({ taskData }: EditTaskFormProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang as string
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState(taskData.category)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false) // Toggle between display and picker
  const [budgetType, setBudgetType] = useState<'fixed' | 'range'>(taskData.budgetType)
  const [urgency, setUrgency] = useState<'same_day' | 'within_week' | 'flexible'>(taskData.urgency)

  // Handle category change - update state
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    if (newCategory) {
      setShowCategoryPicker(false) // Hide picker once category is selected
    }
  }

  // Handle category reset - show picker
  const handleCategoryReset = () => {
    setShowCategoryPicker(true)
  }

  const form = useForm({
    defaultValues: {
      category: taskData.category,
      subcategory: taskData.subcategory || '',
      title: taskData.title,
      description: taskData.description,
      requirements: taskData.requirements || '',
      city: taskData.city,
      neighborhood: taskData.neighborhood || '',
      exactAddress: taskData.exactAddress || '',
      budgetType: taskData.budgetType,
      budgetMin: taskData.budgetMin,
      budgetMax: taskData.budgetMax,
      urgency: taskData.urgency,
      deadline: taskData.deadline,
      photos: taskData.photos || [],
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true)
        console.log('Saving task changes:', value)

        // TODO: Implement API call
        // const response = await fetch(`/api/tasks/${taskData.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(value),
        // })

        // if (!response.ok) throw new Error('Failed to update task')

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Show success toast
        toast({
          title: t('editTask.successMessage', 'Task updated successfully!'),
          variant: 'success'
        })

        // Redirect back to posted tasks
        router.push(`/${lang}/tasks/posted`)
      } catch (error) {
        console.error('Error updating task:', error)
        toast({
          title: t('editTask.errorMessage', 'Error updating task. Please try again.'),
          variant: 'destructive'
        })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit]}
    >
      {([canSubmit]) => (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-8"
        >
          {/* Category - Show as chip by default, allow changing if needed */}
          {!showCategoryPicker && category ? (
            <CategoryDisplay category={category} onReset={handleCategoryReset} />
          ) : (
            <CategorySelection form={form} onCategoryChange={handleCategoryChange} />
          )}

          {/* Show remaining sections (category is already set in edit mode) */}
          {category && (
            <>
              {/* Task Details */}
              <TaskDetailsSection form={form} />

              {/* Location */}
              <LocationSection form={form} />

              {/* Budget */}
              <BudgetSection form={form} budgetType={budgetType} onBudgetTypeChange={setBudgetType} />

              {/* Timeline */}
              <TimelineSection form={form} urgency={urgency} onUrgencyChange={setUrgency} />

              {/* Photos */}
              <PhotosSection form={form} />

              {/* Review & Submit */}
              <ReviewSection form={form} />

              {/* Submit Button - Different text for edit mode */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 pb-4">
                <Button
                  type="button"
                  size="lg"
                  variant="bordered"
                  onPress={() => router.push(`/${lang}/tasks/posted`)}
                  className="min-w-[200px] h-14 font-semibold text-lg"
                >
                  {t('editTask.cancelEdit', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting || !canSubmit}
                  className={`min-w-[300px] h-16 font-bold text-xl transition-all duration-300 ${
                    !canSubmit
                      ? 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 shadow-xl hover:shadow-blue-500/50 hover:scale-105'
                  }`}
                >
                  {isSubmitting
                    ? t('editTask.savingChanges', 'Saving changes...')
                    : t('editTask.saveChanges', 'Save Changes')
                  }
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </form.Subscribe>
  )
}
