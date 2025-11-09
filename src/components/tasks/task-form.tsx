'use client'

import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { uploadTaskImage, deleteTaskImage } from '@/lib/utils/image-upload'
import { defaultFormValues } from '@/app/[lang]/create-task/lib/validation'
import { CategorySelection } from '@/app/[lang]/create-task/components/category-selection'
import { TaskDetailsSection } from '@/app/[lang]/create-task/components/task-details-section'
import { LocationSection } from '@/app/[lang]/create-task/components/location-section'
import { BudgetSection } from '@/app/[lang]/create-task/components/budget-section'
import { TimelineSection } from '@/app/[lang]/create-task/components/timeline-section'
import { PhotosSection } from '@/app/[lang]/create-task/components/photos-section'
import { ReviewSection } from '@/app/[lang]/create-task/components/review-section'
import { CategoryDisplay } from '@/app/[lang]/tasks/[id]/edit/components/category-display'
import { ValidationErrorDialog } from '@/components/tasks/validation-error-dialog'

interface TaskFormData {
  id?: string
  title: string
  description: string
  category: string
  subcategory?: string
  city: string
  neighborhood?: string
  exactAddress?: string
  requirements?: string
  budgetType: 'fixed' | 'range' | 'unclear'
  budgetMin?: number | null
  budgetMax?: number | null
  urgency: 'same_day' | 'within_week' | 'flexible'
  deadline?: Date
  images?: string[]
  photoFile?: File
  imageOversized?: boolean
}

interface TaskFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<TaskFormData>
  taskId?: string
}

export function TaskForm({ mode, initialData, taskId }: TaskFormProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const locale = (params?.lang as string) || i18n.language || 'bg'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState(initialData?.category || '')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [budgetType, setBudgetType] = useState<'fixed' | 'range' | 'unclear'>(
    initialData?.budgetType || 'unclear'
  )
  const [urgency, setUrgency] = useState<'same_day' | 'within_week' | 'flexible'>(
    initialData?.urgency || 'flexible'
  )
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([])

  // Refs for scrolling to sections
  const categoryRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const budgetRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const form = useForm({
    defaultValues: mode === 'edit' && initialData
      ? {
          category: initialData.category || '',
          subcategory: initialData.subcategory || '',
          title: initialData.title || '',
          description: initialData.description || '',
          requirements: initialData.requirements || '',
          city: initialData.city || '',
          neighborhood: initialData.neighborhood || '',
          exactAddress: initialData.exactAddress || '',
          budgetType: initialData.budgetType || 'unclear',
          budgetMin: initialData.budgetMin,
          budgetMax: initialData.budgetMax,
          urgency: initialData.urgency || 'flexible',
          deadline: initialData.deadline,
          photos: initialData.images || [],
        }
      : defaultFormValues,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true)

        // Handle image upload
        let imageUrl = null
        const photoFile = (value as any).photoFile
        const imageSkipped = (value as any).imageOversized === true

        if (mode === 'create') {
          // CREATE MODE: Upload new image
          if (photoFile && user && !imageSkipped) {
            const tempTaskId = `temp-${Date.now()}`
            const { url, error } = await uploadTaskImage(tempTaskId, user.id, photoFile)

            if (error) {
              toast({
                title: t('createTask.imageUpload.error', 'Image upload failed'),
                description: error,
                variant: 'destructive'
              })
              return
            }

            imageUrl = url
          }

          // Prepare CREATE payload
          const taskData = {
            ...value,
            photoUrls: imageUrl ? [imageUrl] : [],
            photoFile: undefined,
            imageOversized: undefined
          }

          // Call CREATE API
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
            credentials: 'include'
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || 'Failed to create task')
          }

          // Success toast
          if (imageSkipped) {
            toast({
              title: t('createTask.success', 'Task created successfully!'),
              description: t('createTask.successWithoutImage', 'Your task has been posted without an image.'),
              variant: 'success'
            })
          } else {
            toast({
              title: t('createTask.success', 'Task created successfully!'),
              description: t('createTask.successMessage', 'Your task has been posted and is now visible to professionals.'),
              variant: 'success'
            })
          }

        } else {
          // EDIT MODE: Handle image update/delete
          if (photoFile && user) {
            const { url, error } = await uploadTaskImage(taskId!, user.id, photoFile)

            if (error) {
              toast({
                title: t('editTask.imageUpload.error', 'Image upload failed'),
                description: error,
                variant: 'destructive'
              })
              return
            }

            imageUrl = url

            // Delete old image if different
            if (initialData?.images && initialData.images.length > 0 && initialData.images[0] !== imageUrl) {
              await deleteTaskImage(initialData.images[0])
            }
          } else if (!value.photos || value.photos.length === 0) {
            // User removed the image
            if (initialData?.images && initialData.images.length > 0) {
              await deleteTaskImage(initialData.images[0])
            }
          }

          // Prepare EDIT payload
          const payload = {
            ...value,
            budgetMin: value.budgetMin ?? undefined,
            budgetMax: value.budgetMax ?? undefined,
            photoUrls: imageUrl ? [imageUrl] : (value.photos || []),
            photos: undefined,
            photoFile: undefined,
          }

          // Call UPDATE API
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || 'Failed to update task')
          }

          // Success toast
          toast({
            title: t('editTask.successMessage', 'Task updated successfully!'),
            description: t('editTask.cachingNotice', 'Note: Changes may take up to 1 hour to appear on the public task page due to performance optimization.'),
            variant: 'success',
            duration: 8000,
          })
        }

        // Redirect to posted tasks
        router.push(`/${locale}/tasks/posted`)

      } catch (error: any) {
        console.error(`Error ${mode}ing task:`, error)

        toast({
          title: mode === 'create'
            ? t('createTask.error', 'Error creating task')
            : t('editTask.errorMessage', 'Error updating task. Please try again.'),
          description: error.message,
          variant: 'destructive'
        })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    if (newCategory && mode === 'edit') {
      setShowCategoryPicker(false)
    }
  }

  // Handle category reset (edit mode only)
  const handleCategoryReset = () => {
    setShowCategoryPicker(true)
  }

  // Handle validation errors - scroll to first error
  const handleScrollToFirstError = () => {
    if (validationErrors.length === 0) return

    const firstErrorField = validationErrors[0].field
    const fieldToRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
      category: categoryRef,
      subcategory: categoryRef,
      title: detailsRef,
      description: detailsRef,
      requirements: detailsRef,
      city: locationRef,
      neighborhood: locationRef,
      exactAddress: locationRef,
      budgetMin: budgetRef,
      budgetMax: budgetRef,
      urgency: timelineRef,
      deadline: timelineRef,
    }

    const targetRef = fieldToRefMap[firstErrorField]
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Try to focus the first input within the section
      setTimeout(() => {
        const firstInput = targetRef.current?.querySelector('input, textarea, button') as HTMLElement
        firstInput?.focus()
      }, 500)
    }
  }

  // Collect validation errors from form state
  const collectValidationErrors = () => {
    const errors: Array<{ field: string; message: string }> = []

    // Define all form fields to check
    const fieldsToCheck = [
      'category', 'subcategory', 'title', 'description', 'requirements',
      'city', 'neighborhood', 'exactAddress',
      'budgetMin', 'budgetMax',
      'urgency', 'deadline'
    ]

    // Check each field for errors
    fieldsToCheck.forEach(fieldName => {
      try {
        const fieldState = form.getFieldValue(fieldName as any)
        const fieldMeta = form.getFieldMeta(fieldName as any)

        if (fieldMeta?.errors && fieldMeta.errors.length > 0) {
          errors.push({
            field: fieldName,
            message: fieldMeta.errors[0] // Take first error for each field
          })
        }
      } catch (e) {
        // Field might not exist, skip it
      }
    })

    return errors
  }

  // Handle form submit attempt with validation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Always validate all fields on submit attempt (using 'change' to trigger onChange validators)
    await form.validateAllFields('change')

    // Small delay to let form state update
    setTimeout(() => {
      // Check if form is valid after validation
      if (!form.state.canSubmit || !form.state.isValid) {
        const errors = collectValidationErrors()
        if (errors.length > 0) {
          setValidationErrors(errors)
          setShowValidationDialog(true)
        }
        return
      }

      // Form is valid, proceed with submission
      form.handleSubmit()
    }, 100)
  }

  return (
    <>
      <ValidationErrorDialog
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        errors={validationErrors}
        onFixClick={handleScrollToFirstError}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit]}
      >
        {([canSubmit]) => (
          <form
            onSubmit={handleFormSubmit}
            className="space-y-8"
          >
          {/* Category - Edit mode shows display by default, create mode always shows picker */}
          <div ref={categoryRef}>
            {mode === 'edit' && !showCategoryPicker && category ? (
              <CategoryDisplay category={category} onReset={handleCategoryReset} />
            ) : (
              <CategorySelection form={form} onCategoryChange={handleCategoryChange} />
            )}
          </div>

          {/* Show remaining sections only after category is selected */}
          {category && (
            <>
              {/* Task Details */}
              <div ref={detailsRef}>
                <TaskDetailsSection form={form} />
              </div>

              {/* Location */}
              <div ref={locationRef}>
                <LocationSection form={form} />
              </div>

              {/* Budget */}
              <div ref={budgetRef}>
                <BudgetSection form={form} budgetType={budgetType} onBudgetTypeChange={setBudgetType} />
              </div>

              {/* Timeline */}
              <div ref={timelineRef}>
                <TimelineSection form={form} urgency={urgency} onUrgencyChange={setUrgency} />
              </div>

              {/* Photos */}
              <PhotosSection form={form} initialImages={mode === 'edit' ? initialData?.images : undefined} />

              {/* Review & Submit */}
              <ReviewSection form={form} />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 pb-4">
                {mode === 'edit' && (
                  <Button
                    type="button"
                    size="lg"
                    variant="bordered"
                    onPress={() => router.push(`/${locale}/tasks/posted`)}
                    className="min-w-[200px] h-14 font-semibold text-lg"
                  >
                    {t('editTask.cancelEdit', 'Cancel')}
                  </Button>
                )}
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                  className={`min-w-[300px] h-16 font-bold text-xl transition-all duration-300 ${
                    mode === 'edit'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 shadow-xl hover:shadow-blue-500/50 hover:scale-105'
                      : 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 shadow-xl hover:shadow-green-500/50 hover:scale-105'
                  }`}
                  radius="lg"
                >
                  {isSubmitting
                    ? mode === 'edit'
                      ? t('editTask.savingChanges', 'Saving changes...')
                      : t('loading', 'Loading...')
                    : mode === 'edit'
                      ? t('editTask.saveChanges', 'Save Changes')
                      : t('createTask.review.submit', 'Post Task')
                  }
                </Button>
              </div>
            </>
          )}
          </form>
        )}
      </form.Subscribe>
    </>
  )
}
