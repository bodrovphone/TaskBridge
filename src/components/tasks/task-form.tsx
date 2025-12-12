'use client'

import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth'
import { uploadTaskImage, deleteTaskImage } from '@/lib/utils/image-upload'
import { POSTED_TASKS_QUERY_KEY } from '@/hooks/use-posted-tasks'
import { defaultFormValues } from '@/app/[lang]/create-task/lib/validation'
import { CategorySelection } from '@/app/[lang]/create-task/components/category-selection'
import { TitleCategorySection } from '@/app/[lang]/create-task/components/title-category-section'
import { TaskDetailsSection } from '@/app/[lang]/create-task/components/task-details-section'
import { LocationSection } from '@/app/[lang]/create-task/components/location-section'
import { BudgetSection } from '@/app/[lang]/create-task/components/budget-section'
import { TimelineSection } from '@/app/[lang]/create-task/components/timeline-section'
import { PhotosSection } from '@/app/[lang]/create-task/components/photos-section'
import { ReviewSection } from '@/app/[lang]/create-task/components/review-section'
import { CategoryDisplay } from '@/app/[lang]/tasks/[id]/edit/components/category-display'
import { ValidationErrorDialog } from '@/components/tasks/validation-error-dialog'
import { NotificationWarningBanner } from '@/components/ui/notification-warning-banner'

interface TaskFormData {
  id?: string
  title: string
  description: string
  category: string
  subcategory?: string
  city: string
  neighborhood?: string
  requirements?: string
  budgetType: 'fixed' | 'range' | 'unclear'
  budgetMin?: number | null
  budgetMax?: number | null
  urgency: 'same_day' | 'within_week' | 'flexible'
  deadline?: Date
  images?: string[]
  photoFiles?: File[]
  imageOversized?: boolean
}

interface TaskFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<TaskFormData>
  taskId?: string
  isReopening?: boolean
  inviteProfessionalId?: string
}

/**
 * Map server-side Zod validation error messages to i18n translation keys
 * The server returns raw English strings from Zod; we convert them to translation keys
 */
const mapServerErrorToTranslationKey = (message: string): string => {
  const errorMappings: Record<string, string> = {
    // Title validation
    'Title must be at least 10 characters': 'createTask.errors.titleTooShort',
    'Title must be less than 200 characters': 'createTask.errors.titleTooLong',
    // Description validation
    'Description must be at least 15 characters': 'createTask.errors.descriptionTooShort',
    'Description must be less than 2000 characters': 'createTask.errors.descriptionTooLong',
    // Required fields
    'Category is required': 'createTask.errors.categoryRequired',
    'City is required': 'createTask.errors.cityRequired',
    // Budget validation
    'Maximum budget must be greater than minimum budget': 'createTask.errors.budgetInvalid',
    // Photos validation
    'Maximum 5 photos allowed': 'createTask.errors.maxPhotos',
  }
  return errorMappings[message] || message
}

export function TaskForm({
  mode,
  initialData,
  taskId,
  isReopening,
  inviteProfessionalId
}: TaskFormProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, authenticatedFetch } = useAuth()
  const queryClient = useQueryClient()
  const locale = (params?.lang as string) || i18n.language || 'bg'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([])
  const [showNotificationWarning, setShowNotificationWarning] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const categoryRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const detailsSectionRef = useRef<{ focusTitleInput: () => void; focusDescriptionInput: () => void }>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const budgetRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const [category, setCategory] = useState(initialData?.category || '')
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '')
  const [budgetType, setBudgetType] = useState<'fixed' | 'range' | 'unclear'>(
    initialData?.budgetType || 'unclear'
  )
  const [urgency, setUrgency] = useState<'same_day' | 'within_week' | 'flexible'>(
    initialData?.urgency || 'flexible'
  )

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || '')
      setSubcategory(initialData.subcategory || '')
      setBudgetType(initialData.budgetType || 'unclear')
      setUrgency(initialData.urgency || 'flexible')
    }
  }, [initialData])

  useEffect(() => {
    if (user?.id && mode === 'create') {
      fetch(`/api/users/${user.id}/notification-channel`)
        .then(res => res.json())
        .then(data => {
          setShowNotificationWarning(data.showWarning || false)
        })
        .catch(error => {
          console.error('Failed to check notification channel:', error)
          setShowNotificationWarning(false)
        })
    }
  }, [user?.id, mode])

  const form = useForm({
    defaultValues: (mode === 'edit' || isReopening) && initialData
      ? {
          ...defaultFormValues,
          ...initialData,
          photos: initialData.images || [],
        }
      : defaultFormValues,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true)

        const uploadedImageUrls: string[] = []
        const photoFiles = (value as any).photoFiles || []

        if (photoFiles.length > 0 && user) {
          const effectiveTaskId = mode === 'create' ? `temp-${Date.now()}` : taskId!
          for (const [index, file] of photoFiles.entries()) {
            const { url, error } = await uploadTaskImage(effectiveTaskId, user.id, file, index + 1)
            if (error) {
              toast({
                title: t('createTask.imageUpload.error', 'Image upload failed'),
                description: error,
                variant: 'destructive',
              })
              continue
            }
            if (url) {
              uploadedImageUrls.push(url)
            }
          }
        }

        if (mode === 'create') {
          const taskData = {
            ...value,
            sourceLocale: locale, // For auto-translation to Bulgarian
            photoUrls: uploadedImageUrls,
            photoFiles: undefined,
            imageOversized: undefined,
          }

          // Debug: log what we're sending
          console.log('[TaskForm] Submitting task data:', JSON.stringify(taskData, null, 2))

          const response = await authenticatedFetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
            credentials: 'include',
          })

          const result = await response.json()

          // Debug: log the response
          console.log('[TaskForm] API response:', response.status, result)

          if (!response.ok) {
            // Handle server-side validation errors with details
            if (result.details?.errors) {
              const serverErrors = Object.entries(result.details.errors).map(([field, message]) => ({
                field,
                message: mapServerErrorToTranslationKey(message as string)
              }))
              console.log('[TaskForm] Server validation errors:', serverErrors)
              setValidationErrors(serverErrors)
              setShowValidationDialog(true)
              setIsSubmitting(false)
              return
            }
            throw new Error(result.error || 'Failed to create task')
          }

          const createdTaskId = result.task?.id || result.id
          if (inviteProfessionalId && createdTaskId) {
            // Handle invitation logic...
          } else {
            toast({
              title: t('createTask.success', 'Task created successfully!'),
              variant: 'success',
            })
          }
        } else { // EDIT MODE
          const existingImages = initialData?.images || []
          const finalImages = value.photos || []
          
          const imagesToDelete = existingImages.filter(img => !finalImages.includes(img))
          for (const imageUrl of imagesToDelete) {
            await deleteTaskImage(imageUrl)
          }

          const allImageUrls = [...finalImages, ...uploadedImageUrls];

          const payload = {
            ...value,
            budgetMin: value.budgetMin ?? undefined,
            budgetMax: value.budgetMax ?? undefined,
            photoUrls: allImageUrls,
            photoFiles: undefined,
          }

          const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          })

          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Failed to update task')
          }

          toast({
            title: t('editTask.successMessage', 'Task updated successfully!'),
            variant: 'success',
          })
        }

        await queryClient.invalidateQueries({ queryKey: POSTED_TASKS_QUERY_KEY })
        router.push(`/${locale}/tasks/posted`)

      } catch (error: any) {
        toast({
          title: mode === 'create' ? t('createTask.error', 'Error creating task') : t('editTask.errorMessage', 'Error updating task'),
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    if (newCategory && mode === 'edit') setShowCategoryPicker(false)
    if (newCategory && mode === 'create') {
      setTimeout(() => detailsSectionRef.current?.focusTitleInput(), 300)
    }
  }

  const handleCategoryReset = () => setShowCategoryPicker(true)
  const handleConnectTelegram = () => router.push(`/${locale}/profile/customer#telegram`)
  const handleVerifyEmail = () => router.push(`/${locale}/profile/customer#email`)
  const handleDismissBanner = () => setBannerDismissed(true)

  const handleScrollToFirstError = () => {
    if (validationErrors.length === 0) return
    const firstErrorField = validationErrors[0].field
    const fieldToRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
      category: categoryRef, subcategory: categoryRef, title: detailsRef, description: detailsRef,
      requirements: detailsRef, city: locationRef, neighborhood: locationRef,
      budgetMin: budgetRef, budgetMax: budgetRef, urgency: timelineRef, deadline: timelineRef,
    }
    const targetRef = fieldToRefMap[firstErrorField]
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        const firstInput = targetRef.current?.querySelector('input, textarea, button') as HTMLElement
        firstInput?.focus()
      }, 500)
    }
  }

  const handleScrollToField = (field: 'title' | 'description' | 'city') => {
    // In create mode, title is in TitleCategorySection (categoryRef), otherwise in detailsRef
    const fieldToRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
      title: mode === 'create' ? categoryRef : detailsRef,
      description: detailsRef,
      city: locationRef,
    }
    const targetRef = fieldToRefMap[field]
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        // Find the appropriate input/textarea in the section
        let selector = 'input, textarea'
        if (field === 'description') selector = 'textarea'
        if (field === 'city') selector = 'button[aria-haspopup="listbox"], select'
        const input = targetRef.current?.querySelector(selector) as HTMLElement
        input?.focus()
      }, 500)
    }
  }

  const collectValidationErrors = () => {
    const errors: Array<{ field: string; message: string }> = []
    const fieldsToCheck = [
      'category', 'subcategory', 'title', 'description', 'requirements',
      'city', 'neighborhood',
      'budgetMin', 'budgetMax', 'urgency', 'deadline',
    ]
    fieldsToCheck.forEach(fieldName => {
      try {
        const fieldMeta = form.getFieldMeta(fieldName as any)
        if (fieldMeta?.errors && fieldMeta.errors.length > 0) {
          errors.push({ field: fieldName, message: fieldMeta.errors[0] })
        }
      } catch (e) { /* Field might not exist */ }
    })
    return errors
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await form.validateAllFields('change')
    setTimeout(() => {
      if (!form.state.canSubmit || !form.state.isValid) {
        const errors = collectValidationErrors()
        if (errors.length > 0) {
          setValidationErrors(errors)
          setShowValidationDialog(true)
        }
        return
      }
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
      <form.Subscribe selector={(state) => [state.canSubmit]}>
        {([canSubmit]) => (
          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div ref={categoryRef}>
              {(mode === 'edit' || isReopening) ? (
                // Edit/reopen mode: use existing category flow
                !showCategoryPicker && category ? (
                  <CategoryDisplay category={category} subcategory={subcategory} onReset={handleCategoryReset} />
                ) : (
                  <CategorySelection form={form} onCategoryChange={handleCategoryChange} />
                )
              ) : (
                // Create mode: use title-first flow with smart category matching
                <TitleCategorySection
                  form={form}
                  onCategoryConfirmed={(cat, subcat) => {
                    setCategory(cat)
                    setSubcategory(subcat)
                    form.setFieldValue('category', cat)
                    form.setFieldValue('subcategory', subcat)
                  }}
                  initialTitle={initialData?.title}
                  initialCategory={initialData?.category}
                  initialSubcategory={initialData?.subcategory}
                />
              )}
            </div>

            {/* Create mode: gate on subcategory (from title-first flow), Edit mode: gate on category */}
            {(mode === 'create' ? subcategory : category) && (
              <>
                {mode === 'create' && showNotificationWarning && !bannerDismissed && (
                  <div className="mb-8">
                    <NotificationWarningBanner
                      onConnectTelegram={handleConnectTelegram}
                      onVerifyEmail={handleVerifyEmail}
                      onDismiss={handleDismissBanner}
                    />
                  </div>
                )}
                <div ref={detailsRef}>
                  <TaskDetailsSection
                    ref={detailsSectionRef}
                    form={form}
                    hideTitle={mode === 'create'}
                  />
                </div>
                <div ref={locationRef}>
                  <LocationSection form={form} />
                </div>
                <div ref={budgetRef}>
                  <BudgetSection form={form} budgetType={budgetType} onBudgetTypeChange={setBudgetType} />
                </div>
                <div ref={timelineRef}>
                  <TimelineSection form={form} urgency={urgency} onUrgencyChange={setUrgency} />
                </div>
                <PhotosSection form={form} initialImages={(mode === 'edit' || isReopening) ? initialData?.images : undefined} />
                <ReviewSection form={form} onScrollToField={handleScrollToField} />
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 pb-4">
                  {mode === 'edit' && (
                    <Button type="button" size="lg" variant="bordered" onPress={() => router.push(`/${locale}/tasks/posted`)} className="min-w-[200px] h-14 font-semibold text-lg">
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
                        : t('createTask.review.submit', 'Post Task')}
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
