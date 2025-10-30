'use client'

import { useTranslation } from 'react-i18next'
import { Input, Textarea, Card, CardBody } from '@nextui-org/react'
import { FileText } from 'lucide-react'

interface TaskDetailsSectionProps {
 form: any
}

export function TaskDetailsSection({ form }: TaskDetailsSectionProps) {
 const { t } = useTranslation()

 return (
  <Card className="shadow-md border border-gray-100">
   <CardBody className="p-6 md:p-8 space-y-6">
    {/* Section Header */}
    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
     <div className="p-2 bg-blue-100 rounded-lg">
      <FileText className="w-6 h-6 text-blue-600" />
     </div>
     <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
       {t('createTask.details.title', 'Tell us about your task')}
      </h2>
      <p className="text-gray-600">
       {t('createTask.details.subtitle', 'Provide clear information to attract the right professionals')}
      </p>
     </div>
    </div>

   {/* Task Title */}
   <form.Field
    name="title"
    validators={{
     onBlur: ({ value }: any) => {
      if (!value || value.length < 10) {
       return 'createTask.errors.titleTooShort'
      }
      if (value.length > 200) {
       return 'createTask.errors.titleTooLong'
      }
      return undefined
     }
    }}
   >
    {(field: any) => (
     <div className="space-y-2">
      <div className="flex items-center justify-between">
       <label htmlFor="task-title" className="text-sm font-medium text-gray-700">
        {t('createTask.details.titleLabel', 'Task Title')} <span className="text-red-500">*</span>
       </label>
       <span className="text-xs text-gray-400">
        {(field.state.value || '').length}/200
       </span>
      </div>
      <Input
       id="task-title"
       placeholder={t('createTask.details.titlePlaceholder', 'What do you need done?')}
       description={t('createTask.details.titleHelp', 'Be specific and clear (e.g., "Professional house cleaning for 2-bedroom apartment")')}
       value={field.state.value || ''}
       onValueChange={field.handleChange}
       onBlur={field.handleBlur}
       isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
       errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
       classNames={{
        input: 'text-base',
       }}
      />
     </div>
    )}
   </form.Field>

   {/* Task Description */}
   <form.Field
    name="description"
    validators={{
     onBlur: ({ value }: any) => {
      if (!value || value.length < 30) {
       return 'createTask.errors.descriptionTooShort'
      }
      if (value.length > 2000) {
       return 'createTask.errors.descriptionTooLong'
      }
      return undefined
     }
    }}
   >
    {(field: any) => (
     <div className="space-y-2">
      <div className="flex items-center justify-between">
       <label htmlFor="task-description" className="text-sm font-medium text-gray-700">
        {t('createTask.details.descriptionLabel', 'Description')} <span className="text-red-500">*</span>
       </label>
       <span className="text-xs text-gray-400">
        {(field.state.value || '').length}/2000
       </span>
      </div>
      <Textarea
       id="task-description"
       placeholder={t('createTask.details.descriptionPlaceholder', 'Describe your task in detail...')}
       description={t('createTask.details.descriptionHelp', 'Include all important details: what needs to be done, any special requirements, tools/materials needed, etc.')}
       value={field.state.value || ''}
       onValueChange={field.handleChange}
       onBlur={field.handleBlur}
       isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
       errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
       minRows={6}
       disableAutosize
       classNames={{
        input: 'text-base resize-none',
       }}
      />
     </div>
    )}
   </form.Field>

   {/* Requirements (Optional) */}
   <form.Field name="requirements">
    {(field: any) => (
     <div className="space-y-2">
      <label htmlFor="task-requirements" className="text-sm font-medium text-gray-700">
       {t('createTask.details.requirementsLabel', 'Specific Requirements (Optional)')}
      </label>
      <Textarea
       id="task-requirements"
       placeholder={t('createTask.details.requirementsPlaceholder', '• Requirement 1\n• Requirement 2\n• Requirement 3')}
       description={t('createTask.details.requirementsHelp', 'List any special skills, certifications, or equipment needed (one per line)')}
       value={field.state.value || ''}
       onValueChange={(val) => {
        // Ensure value starts with bullet point if not empty
        if (val && !val.startsWith('• ')) {
         field.handleChange('• ' + val)
        } else {
         field.handleChange(val)
        }
       }}
       onKeyDown={(e) => {
        if (e.key === 'Enter') {
         e.preventDefault()
         const currentValue = field.state.value || ''
         // Add new line with bullet point
         field.handleChange(currentValue + '\n• ')
        }
       }}
       minRows={4}
       maxRows={4}
       classNames={{
        base: 'w-full',
        input: 'text-base resize-none',
       }}
      />
     </div>
    )}
   </form.Field>
   </CardBody>
  </Card>
 )
}
