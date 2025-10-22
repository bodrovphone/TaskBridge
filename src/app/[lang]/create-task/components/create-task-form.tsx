'use client'

import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { defaultFormValues } from '../lib/validation'
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
 const [category, setCategory] = useState('')
 const [budgetType, setBudgetType] = useState<'fixed' | 'range'>('range')
 const [urgency, setUrgency] = useState<'same_day' | 'within_week' | 'flexible'>('flexible')

 const form = useForm({
  defaultValues: defaultFormValues,
  onSubmit: async ({ value }) => {
   try {
    setIsSubmitting(true)
    console.log('Form data:', value)

    // TODO: Implement API call
    // const response = await fetch('/api/tasks', {
    //  method: 'POST',
    //  headers: { 'Content-Type': 'application/json' },
    //  body: JSON.stringify(value),
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
  },
 })

 return (
  <form.Subscribe
   selector={(state) => [state.canSubmit, state.isSubmitting]}
  >
   {([canSubmit, _formIsSubmitting]) => (
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
