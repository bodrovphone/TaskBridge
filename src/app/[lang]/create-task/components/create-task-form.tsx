'use client'

import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { useToast } from '@/hooks/use-toast'
import { defaultFormValues } from '../lib/validation'
import { CategorySelection } from './category-selection'
import { TaskDetailsSection } from './task-details-section'
import { LocationSection } from './location-section'
import { BudgetSection } from './budget-section'
import { TimelineSection } from './timeline-section'
import { PhotosSection } from './photos-section'
import { ReviewSection } from './review-section'

export function CreateTaskForm() {
 const { t, i18n } = useTranslation()
 const router = useRouter()
 const params = useParams()
 const { toast } = useToast()
 const locale = (params?.lang as string) || i18n.language || 'en'

 const [isSubmitting, setIsSubmitting] = useState(false)
 const [category, setCategory] = useState('')
 const [budgetType, setBudgetType] = useState<'fixed' | 'range'>('range')
 const [urgency, setUrgency] = useState<'same_day' | 'within_week' | 'flexible'>('flexible')

 const form = useForm({
  defaultValues: defaultFormValues,
  onSubmit: async ({ value }) => {
   try {
    setIsSubmitting(true)

    // Call task creation API
    const response = await fetch('/api/tasks', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(value),
     credentials: 'include' // Include auth cookies
    })

    const result = await response.json()

    if (!response.ok) {
     // Handle API errors
     throw new Error(result.error || 'Failed to create task')
    }

    // Success! Show toast notification
    toast({
     title: t('createTask.success', 'Task created successfully!'),
     description: t('createTask.successMessage', 'Your task has been posted and is now visible to professionals.'),
     variant: 'default'
    })

    // Redirect to posted tasks page
    router.push(`/${locale}/tasks/posted`)
   } catch (error: any) {
    console.error('Error creating task:', error)

    // Show error toast
    toast({
     title: t('createTask.error', 'Error creating task'),
     description: error.message || t('createTask.errorMessage', 'Please try again later.'),
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
     {/* Category Selection */}
     <CategorySelection form={form} onCategoryChange={setCategory} />

     {/* Show remaining sections only after category is selected */}
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

       {/* Submit Button */}
       <div className="flex flex-col items-center gap-3 pt-8 pb-4">
        <Button
         type="submit"
         size="lg"
         isLoading={isSubmitting}
         isDisabled={isSubmitting || !canSubmit}
         className={`min-w-[300px] h-16 font-bold text-xl transition-all duration-300 ${
          !canSubmit
           ? 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600'
           : 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 shadow-xl hover:shadow-green-500/50 hover:scale-105'
         }`}
         radius="lg"
        >
         {isSubmitting ? t('loading', 'Loading...') : t('createTask.review.submit')}
        </Button>
        {!canSubmit && (
         <div className="flex flex-col gap-1 items-center">
          <p className="text-sm font-semibold text-orange-600 text-center">
           ⚠️ {t('createTask.review.fillRequired', 'Please fill in all required fields to submit')}
          </p>
         </div>
        )}
       </div>
      </>
     )}
    </form>
   )}
  </form.Subscribe>
 )
}
