'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody } from '@nextui-org/react'
import { Clock, Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { enGB, bg, ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './timeline-section.css'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface TimelineSectionProps {
 form: any
 urgency: 'same_day' | 'within_week' | 'flexible' | undefined
 // eslint-disable-next-line no-unused-vars
 onUrgencyChange: (urgency: 'same_day' | 'within_week' | 'flexible') => void
}

export function TimelineSection({ form, urgency, onUrgencyChange }: TimelineSectionProps) {
 const { t, i18n } = useTranslation()

 // Map app language to date-fns locale
 const dateLocale = i18n.language === 'bg' ? bg : i18n.language === 'ru' ? ru : enGB

 const urgencyOptions = [
  {
   value: 'same_day' as const,
   title: t('createTask.timeline.urgentTitle', 'Urgent - Same Day'),
   description: t('createTask.timeline.urgentDesc', 'I need this done today'),
   radioColor: 'text-red-500 border-red-500',
  },
  {
   value: 'within_week' as const,
   title: t('createTask.timeline.soonTitle', 'Soon - Within a Week'),
   description: t('createTask.timeline.soonDesc', 'I need this done in the next 7 days'),
   radioColor: 'text-yellow-500 border-yellow-500',
  },
  {
   value: 'flexible' as const,
   title: t('createTask.timeline.flexibleTitle', 'Flexible'),
   description: t('createTask.timeline.flexibleDesc', "I'm flexible with timing"),
   radioColor: 'text-green-500 border-green-500',
  },
 ]

 return (
  <Card className="shadow-md border border-gray-100">
   <CardBody className="p-6 md:p-8 space-y-6">
    {/* Section Header */}
    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
     <div className="p-2 bg-purple-100 rounded-lg">
      <Clock className="w-6 h-6 text-purple-600" />
     </div>
     <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
       {t('createTask.timeline.title', 'When do you need this done?')}
      </h2>
      <p className="text-gray-600">
       {t('createTask.timeline.subtitle', 'Let professionals know your timeline')}
      </p>
     </div>
    </div>

   {/* Urgency Selection */}
   <form.Field name="urgency">
    {(field: any) => (
     <RadioGroup
      value={field.state.value || ''}
      onValueChange={(value: string) => {
       field.handleChange(value as 'same_day' | 'within_week' | 'flexible')
       onUrgencyChange(value as 'same_day' | 'within_week' | 'flexible')
      }}
      className="flex flex-col gap-3"
     >
      {urgencyOptions.map((option) => (
       <div
        key={option.value}
        className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
       >
        <RadioGroupItem
         value={option.value}
         id={`urgency-${option.value}`}
         className={`mt-1 ${option.radioColor}`}
        />
        <Label htmlFor={`urgency-${option.value}`} className="cursor-pointer">
         <div className="font-medium text-gray-900">{option.title}</div>
         <div className="text-sm text-gray-500">{option.description}</div>
        </Label>
       </div>
      ))}
     </RadioGroup>
    )}
   </form.Field>

   {/* Specific Deadline (Optional) - Hidden for same_day urgency */}
   <form.Field name="deadline" key="deadline-field">
    {(field: any) => {
     // Convert stored value to Date object
     const selectedDate = field.state.value
       ? (() => {
           try {
             if (field.state.value instanceof Date) {
               return field.state.value
             } else if (typeof field.state.value === 'string') {
               return new Date(field.state.value)
             } else {
               return new Date(field.state.value)
             }
           } catch (error) {
             return null
           }
         })()
       : null

     // Minimum date: 2 days from now (excluding today and tomorrow)
     const minDate = new Date()
     minDate.setDate(minDate.getDate() + 2)

     // Check if selected date is in the past
     const isPastDate = selectedDate && selectedDate < new Date()

     return (
      <div className="max-w-md">
       <label className="block text-sm font-medium text-foreground mb-1.5">
        {t('createTask.timeline.deadlineLabel', 'Specific Deadline (Optional)')}
       </label>
       {isPastDate && (
        <div className="mb-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
         <p className="text-sm text-amber-800 font-medium">
          ⚠️ {t('createTask.timeline.pastDateWarning', 'This deadline is in the past. Please select a future date or clear this field.')}
         </p>
        </div>
       )}
       <div className="relative">
        <DatePicker
         selected={selectedDate}
         onChange={(date: Date | null) => {
          if (date) {
           // Create date at noon UTC to avoid timezone issues
           const jsDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
           field.handleChange(jsDate)
          } else {
           field.handleChange(undefined)
          }
         }}
         minDate={minDate}
         dateFormat="dd/MM/yyyy"
         locale={dateLocale}
         disabled={urgency === 'same_day' && !isPastDate}
         placeholderText={t('createTask.timeline.selectDate', 'Select date')}
         calendarStartDay={1}
         portalId="root-portal"
         popperClassName="z-[9999]"
         className="w-full h-10 px-3 py-2 text-base rounded-xl border-2 border-default-200 hover:border-default-400 focus:border-primary focus:outline-none disabled:bg-default-100 disabled:cursor-not-allowed transition-colors bg-default-50"
         calendarClassName="!border-2 !border-default-200 !rounded-xl !shadow-xl"
         wrapperClassName="w-full"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-default-400 pointer-events-none" />
       </div>
       <p className="text-xs text-default-500 mt-1.5">
        {t('createTask.timeline.deadlineHelp', "Leave empty if you don't have a specific deadline")}
       </p>
      </div>
     )
    }}
   </form.Field>
   </CardBody>
  </Card>
 )
}
