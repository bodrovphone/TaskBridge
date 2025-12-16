'use client'

import { useTranslation } from 'react-i18next'
import { Input, Textarea, Card, CardBody, Tooltip } from '@nextui-org/react'
import { FileText } from 'lucide-react'
import { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { validateProfanity } from '@/lib/services/profanity-filter'

interface TaskDetailsSectionProps {
 form: any
 hideTitle?: boolean
}

export const TaskDetailsSection = forwardRef<{ focusTitleInput: () => void; focusDescriptionInput: () => void }, TaskDetailsSectionProps>(
 function TaskDetailsSection({ form, hideTitle }, ref) {
  const { t, i18n } = useTranslation()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [showTitleTooltip, setShowTitleTooltip] = useState(false)

  // Expose focus methods to parent
  useImperativeHandle(ref, () => ({
   focusTitleInput: () => {
    setShowTitleTooltip(true)
    setTimeout(() => {
     titleInputRef.current?.focus()
    }, 100)
   },
   focusDescriptionInput: () => {
    setTimeout(() => {
     descriptionTextareaRef.current?.focus()
    }, 100)
   }
  }))

  // Handle title input changes
  const handleTitleChange = (value: string, fieldHandleChange: (val: string) => void) => {
   // Hide tooltip after first character is typed
   if (value.length > 0 && showTitleTooltip) {
    setShowTitleTooltip(false)
   }
   fieldHandleChange(value)
  }

  // Handle Enter key to move to description
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
   if (e.key === 'Enter') {
    e.preventDefault()
    descriptionTextareaRef.current?.focus()
   }
  }

  // Validation helper for title field
  const validateTitle = ({ value }: { value: string }) => {
   if (!value || value.length < 10) {
    return 'createTask.errors.titleTooShort'
   }
   if (value.length > 200) {
    return 'createTask.errors.titleTooLong'
   }
   const profanityCheck = validateProfanity(value, i18n.language, true)
   if (!profanityCheck.valid) {
    return profanityCheck.severity === 'severe'
     ? 'validation.profanitySeverity.severe'
     : 'validation.profanitySeverity.moderate'
   }
   return undefined
  }

  // Validation helper for description field
  const validateDescription = ({ value }: { value: string }) => {
   if (!value || value.length < 15) {
    return 'createTask.errors.descriptionTooShort'
   }
   if (value.length > 2000) {
    return 'createTask.errors.descriptionTooLong'
   }
   const profanityCheck = validateProfanity(value, i18n.language, true)
   if (!profanityCheck.valid) {
    return profanityCheck.severity === 'severe'
     ? 'validation.profanitySeverity.severe'
     : 'validation.profanitySeverity.moderate'
   }
   return undefined
  }

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

   {/* Task Title - hidden when title is captured elsewhere (title-first flow) */}
   {!hideTitle && (
   <form.Field
    name="title"
    validators={{
     onChange: validateTitle,
     onBlur: validateTitle,
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
      <div className="relative">
       {/* Comic-style speech bubble tooltip */}
       {showTitleTooltip && (
        <div className="absolute bottom-full left-4 mb-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
         {/* Tooltip content */}
         <div className="bg-white text-gray-900 shadow-2xl border-2 border-primary/30 rounded-xl px-4 py-3 max-w-md">
          <div className="text-sm font-bold mb-2 text-gray-900">{t('createTask.details.titleTooltipTitle', 'Write a clear task title')}</div>
          <div className="text-xs text-gray-700 leading-relaxed">{t('createTask.details.titleTooltipContent', 'Be specific about what you need. Good examples: "Fix leaking kitchen faucet", "Professional apartment cleaning", "Website homepage redesign"')}</div>
         </div>
         {/* Comic-style tail/pointer */}
         <div className="absolute -bottom-[1px] left-8">
          {/* Border triangle (blue outline) */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-primary/30"></div>
          {/* Main triangle (white fill) */}
          <div className="absolute -top-[1px] left-[1px] w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[13px] border-t-white"></div>
         </div>
        </div>
       )}

       <Input
        id="task-title"
        ref={titleInputRef}
        placeholder={t('createTask.details.titlePlaceholder', 'What do you need done?')}
        description={t('createTask.details.titleHelp', 'Be specific and clear (e.g., "Professional house cleaning for 2-bedroom apartment")')}
        value={field.state.value || ''}
        onValueChange={(val) => handleTitleChange(val, field.handleChange)}
        onBlur={field.handleBlur}
        onKeyDown={handleTitleKeyDown}
        isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
        errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
        classNames={{
         input: 'text-base',
        }}
       />
      </div>
     </div>
    )}
   </form.Field>
   )}

   {/* Task Description */}
   <form.Field
    name="description"
    validators={{
     onChange: validateDescription,
     onBlur: validateDescription,
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
       ref={descriptionTextareaRef}
       placeholder={t('createTask.details.descriptionPlaceholder', 'Describe your task in detail...')}
       description={t('createTask.details.descriptionHelp', 'Include all important details: what needs to be done, any special requirements, tools/materials needed, etc.')}
       value={field.state.value || ''}
       onValueChange={field.handleChange}
       onBlur={field.handleBlur}
       isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
       errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
       minRows={4}
       maxRows={12}
       classNames={{
        input: 'text-base',
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
       minRows={3}
       maxRows={8}
       classNames={{
        base: 'w-full',
        input: 'text-base',
       }}
      />
     </div>
    )}
   </form.Field>
   </CardBody>
  </Card>
 )
})
