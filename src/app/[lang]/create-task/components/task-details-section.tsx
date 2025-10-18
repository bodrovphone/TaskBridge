'use client'

import { useTranslation } from 'react-i18next'
import { Input, Textarea } from '@nextui-org/react'
import { UseFormReturn } from 'react-hook-form'
import { CreateTaskFormData } from '../lib/validation'

interface TaskDetailsSectionProps {
 form: UseFormReturn<CreateTaskFormData>
}

export function TaskDetailsSection({ form }: TaskDetailsSectionProps) {
 const { t } = useTranslation()
 const { register, watch, formState: { errors } } = form

 const title = watch('title') || ''
 const description = watch('description') || ''
 const requirements = watch('requirements') || ''

 return (
  <div className="space-y-6">
   {/* Section Header */}
   <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
     {t('createTask.details.title', 'Tell us about your task')}
    </h2>
    <p className="text-gray-600">
     {t('createTask.details.subtitle', 'Provide clear information to attract the right professionals')}
    </p>
   </div>

   {/* Task Title */}
   <Input
    {...register('title')}
    label={t('createTask.details.titleLabel', 'Task Title')}
    placeholder={t('createTask.details.titlePlaceholder', 'What do you need done?')}
    description={t('createTask.details.titleHelp', 'Be specific and clear (e.g., "Professional house cleaning for 2-bedroom apartment")')}
    isInvalid={!!errors.title}
    errorMessage={errors.title && t(errors.title.message as string)}
    endContent={
     <span className="text-xs text-gray-400">
      {title.length}/200
     </span>
    }
    classNames={{
     input: 'text-base',
    }}
   />

   {/* Task Description */}
   <Textarea
    {...register('description')}
    label={t('createTask.details.descriptionLabel', 'Description')}
    placeholder={t('createTask.details.descriptionPlaceholder', 'Describe your task in detail...')}
    description={t('createTask.details.descriptionHelp', 'Include all important details: what needs to be done, any special requirements, tools/materials needed, etc.')}
    isInvalid={!!errors.description}
    errorMessage={errors.description && t(errors.description.message as string)}
    minRows={6}
    endContent={
     <span className="text-xs text-gray-400">
      {description.length}/2000
     </span>
    }
    classNames={{
     input: 'text-base',
    }}
   />

   {/* Requirements (Optional) */}
   <Textarea
    {...register('requirements')}
    label={t('createTask.details.requirementsLabel', 'Specific Requirements (Optional)')}
    placeholder={t('createTask.details.requirementsPlaceholder', '• Requirement 1\n• Requirement 2\n• Requirement 3')}
    description={t('createTask.details.requirementsHelp', 'List any special skills, certifications, or equipment needed (one per line)')}
    minRows={4}
    endContent={
     <span className="text-xs text-gray-400">
      {requirements.length}
     </span>
    }
    classNames={{
     input: 'text-base',
    }}
   />
  </div>
 )
}
