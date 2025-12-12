'use client'

import React, { useDeferredValue, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, Chip, Divider } from '@nextui-org/react'
import { MapPin, Wallet, Clock, FileText, AlertCircle } from 'lucide-react'
import { TASK_CATEGORIES } from '../lib/validation'
import Image from 'next/image'
import { getCityLabelBySlug } from '@/features/cities'
import { Tip } from '@/components/ui/tip'

interface ReviewSectionProps {
 form: any
 onScrollToField?: (field: 'title' | 'description' | 'city') => void
}

export function ReviewSection({ form, onScrollToField }: ReviewSectionProps) {
 const { t } = useTranslation()
 const [tipDismissed, setTipDismissed] = useState(false)

 // Subscribe to all form field values using TanStack Form
 const [formData, setFormData] = useState<any>({})

 // Use deferred value to throttle re-renders (updates max once per render cycle)
 const deferredFormData = useDeferredValue(formData)

 useEffect(() => {
  // Subscribe to form state changes
  const unsubscribe = form.store.subscribe(() => {
   setFormData(form.state.values)
  })
  // Set initial values
  setFormData(form.state.values)
  return unsubscribe
 }, [form])

 // Get category info
 const categoryInfo = TASK_CATEGORIES.find(cat => cat.value === deferredFormData.category)

 // Check which required fields are missing
 const isTitleMissing = !deferredFormData.title || deferredFormData.title.length < 10
 const isDescriptionMissing = !deferredFormData.description || deferredFormData.description.length < 15
 const isCityMissing = !deferredFormData.city

 // Determine first missing field for tip
 const firstMissingField = isTitleMissing ? 'title' : isDescriptionMissing ? 'description' : isCityMissing ? 'city' : null

 // Reset tip dismissed state when first missing field changes
 useEffect(() => {
  if (firstMissingField) {
   setTipDismissed(false)
  }
 }, [firstMissingField])

 // Format budget display
 const getBudgetDisplay = () => {
  if (deferredFormData.budgetType === 'fixed' && deferredFormData.budgetMax) {
   return `${deferredFormData.budgetMax} лв`
  } else if (deferredFormData.budgetMin && deferredFormData.budgetMax) {
   return `${deferredFormData.budgetMin}-${deferredFormData.budgetMax} лв`
  } else if (deferredFormData.budgetMin) {
   return `${t('taskCard.budget.from')} ${deferredFormData.budgetMin} лв`
  } else if (deferredFormData.budgetMax) {
   return `${t('taskCard.budget.to')} ${deferredFormData.budgetMax} лв`
  }
  return t('taskCard.budget.negotiable')
 }

 // Format deadline display
 const getDeadlineDisplay = () => {
  if (deferredFormData.deadline) {
   return new Date(deferredFormData.deadline).toLocaleDateString()
  }
  if (deferredFormData.urgency === 'same_day') return t('createTask.timeline.urgentTitle')
  if (deferredFormData.urgency === 'within_week') return t('createTask.timeline.soonTitle')
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
      {isTitleMissing ? (
       firstMissingField === 'title' && !tipDismissed ? (
        <Tip
         title={t('createTask.review.tipTitle', 'Title required')}
         description={t('createTask.review.tipTitleDesc', 'Add a clear title (at least 10 characters) so professionals understand your task.')}
         dismissText={t('common.gotIt', 'Got it')}
         variant="warning"
         side="top"
         align="start"
         open={true}
         onOpenChange={() => setTipDismissed(true)}
         onDismiss={() => setTipDismissed(true)}
        >
         <button
          type="button"
          onClick={() => onScrollToField?.('title')}
          className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors w-full text-left"
         >
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <span className="text-orange-700 font-medium">
           {t('createTask.review.noTitle', 'No title yet')}
          </span>
         </button>
        </Tip>
       ) : (
        <button
         type="button"
         onClick={() => onScrollToField?.('title')}
         className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors w-full text-left"
        >
         <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
         <span className="text-orange-700 font-medium">
          {t('createTask.review.noTitle', 'No title yet')}
         </span>
        </button>
       )
      ) : (
       <h3 className="text-xl font-bold text-gray-900 mb-2">
        {deferredFormData.title}
       </h3>
      )}
      {isDescriptionMissing ? (
       firstMissingField === 'description' && !tipDismissed ? (
        <Tip
         title={t('createTask.review.tipDescription', 'Description required')}
         description={t('createTask.review.tipDescriptionDesc', 'Add details about your task (at least 15 characters) to help professionals understand what you need.')}
         dismissText={t('common.gotIt', 'Got it')}
         variant="warning"
         side="top"
         align="start"
         open={true}
         onOpenChange={() => setTipDismissed(true)}
         onDismiss={() => setTipDismissed(true)}
        >
         <button
          type="button"
          onClick={() => onScrollToField?.('description')}
          className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mt-2 cursor-pointer hover:bg-orange-100 transition-colors w-full text-left"
         >
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <span className="text-orange-700">
           {t('createTask.review.noDescription', 'No description yet')}
          </span>
         </button>
        </Tip>
       ) : (
        <button
         type="button"
         onClick={() => onScrollToField?.('description')}
         className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mt-2 cursor-pointer hover:bg-orange-100 transition-colors w-full text-left"
        >
         <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
         <span className="text-orange-700">
          {t('createTask.review.noDescription', 'No description yet')}
         </span>
        </button>
       )
      ) : (
       <p className="text-gray-600 whitespace-pre-wrap mt-2">
        {deferredFormData.description}
       </p>
      )}
     </div>

     <Divider />

     {/* Location */}
     <div>
      <div className="flex items-center gap-2 mb-2">
       <MapPin className={`w-5 h-5 ${isCityMissing ? 'text-orange-500' : 'text-gray-400'}`} />
       <h4 className={`font-semibold ${isCityMissing ? 'text-orange-700' : 'text-gray-900'}`}>
        {t('createTask.review.location', 'Location')}
       </h4>
      </div>
      {isCityMissing ? (
       firstMissingField === 'city' && !tipDismissed ? (
        <Tip
         title={t('createTask.review.tipCity', 'City required')}
         description={t('createTask.review.tipCityDesc', 'Select your city so professionals know where to find you.')}
         dismissText={t('common.gotIt', 'Got it')}
         variant="warning"
         side="top"
         align="start"
         open={true}
         onOpenChange={() => setTipDismissed(true)}
         onDismiss={() => setTipDismissed(true)}
        >
         <button
          type="button"
          onClick={() => onScrollToField?.('city')}
          className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg ml-7 cursor-pointer hover:bg-orange-100 transition-colors text-left"
         >
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <span className="text-orange-700">
           {t('createTask.review.noCity', 'No city selected')}
          </span>
         </button>
        </Tip>
       ) : (
        <button
         type="button"
         onClick={() => onScrollToField?.('city')}
         className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg ml-7 cursor-pointer hover:bg-orange-100 transition-colors text-left"
        >
         <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
         <span className="text-orange-700">
          {t('createTask.review.noCity', 'No city selected')}
         </span>
        </button>
       )
      ) : (
       <p className="text-gray-600 ml-7">
        {getCityLabelBySlug(deferredFormData.city, t)}
        {deferredFormData.neighborhood && `, ${deferredFormData.neighborhood}`}
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
     {deferredFormData.requirements && (
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
         {deferredFormData.requirements}
        </p>
       </div>
      </>
     )}

     {/* Photos */}
     {deferredFormData.photos && deferredFormData.photos.length > 0 && (
      <>
       <Divider />
       <div>
        <h4 className="font-semibold text-gray-900 mb-3">
         {t('createTask.review.photos', 'Photos')} ({deferredFormData.photos.length})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
         {deferredFormData.photos.map((photoUrl: string, index: number) => (
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
