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
import { useAuth } from '@/features/auth/hooks/use-auth'
import { uploadTaskImage, deleteTaskImage } from '@/lib/utils/image-upload'
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
    budgetType: 'fixed' | 'range' | 'unclear'
    budgetMin?: number | null
    budgetMax?: number | null
    urgency: 'same_day' | 'within_week' | 'flexible'
    deadline?: Date
    images?: string[]
    requirements?: string
  }
}

export function EditTaskForm({ taskData }: EditTaskFormProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang as string
  const { toast } = useToast()
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState(taskData.category)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false) // Toggle between display and picker
  const [budgetType, setBudgetType] = useState<'fixed' | 'range' | 'unclear'>(taskData.budgetType)
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
      photos: taskData.images || [],
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true)

        // Handle image upload if there's a new file
        let imageUrl = null
        if (value.photoFile && user) {
          // Upload new image
          const { url, error } = await uploadTaskImage(
            taskData.id,
            user.id,
            value.photoFile
          )

          if (error) {
            toast({
              title: t('editTask.imageUpload.error', 'Image upload failed'),
              description: error,
              variant: 'destructive'
            })
            return // Stop submission if upload fails
          }

          imageUrl = url

          // Delete old image from storage if it exists and is different
          if (taskData.images && taskData.images.length > 0 && taskData.images[0] !== imageUrl) {
            await deleteTaskImage(taskData.images[0])
          }
        } else if (!value.photos || value.photos.length === 0) {
          // User removed the image - delete from storage
          if (taskData.images && taskData.images.length > 0) {
            await deleteTaskImage(taskData.images[0])
          }
        }

        // Transform the form data: convert null to undefined, handle photo URLs
        const payload = {
          ...value,
          budgetMin: value.budgetMin ?? undefined,
          budgetMax: value.budgetMax ?? undefined,
          photoUrls: imageUrl ? [imageUrl] : (value.photos || []),
          photos: undefined, // Remove photos field
          photoFile: undefined, // Remove photoFile field
        }

        // Call API to update task
        const response = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include' // Include auth cookies
        })

        const result = await response.json()

        if (!response.ok) {
          // Handle API errors
          throw new Error(result.error || 'Failed to update task')
        }

        // Show success toast with caching info
        toast({
          title: t('editTask.successMessage', 'Task updated successfully!'),
          description: t('editTask.cachingNotice', 'Note: Changes may take up to 1 hour to appear on the public task page due to performance optimization.'),
          variant: 'success',
          duration: 8000, // Show longer to ensure user reads the caching notice
        })

        // Redirect back to posted tasks
        router.push(`/${lang}/tasks/posted`)
      } catch (error: any) {
        console.error('Error updating task:', error)
        toast({
          title: t('editTask.errorMessage', 'Error updating task. Please try again.'),
          description: error.message,
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
              <PhotosSection form={form} initialImages={taskData.images} />

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
