'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, DatePicker } from '@nextui-org/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { Clock } from 'lucide-react'
import { useParams } from 'next/navigation'

interface TimelineSectionProps {
 form: any
 urgency: 'same_day' | 'within_week' | 'flexible' | undefined
 // eslint-disable-next-line no-unused-vars
 onUrgencyChange: (urgency: 'same_day' | 'within_week' | 'flexible') => void
}

export function TimelineSection({ form, urgency, onUrgencyChange }: TimelineSectionProps) {
 const { t, i18n } = useTranslation()
 const params = useParams()
 const locale = (params?.lang as string) || i18n.language || 'en'

 // Map app locale to date format locale (all use European dd/mm/yyyy format)
 const dateLocale = locale === 'en' ? 'en-GB' : locale === 'bg' ? 'bg-BG' : 'ru-RU'

 const urgencyOptions = [
  {
   value: 'same_day' as const,
   icon: '🔴',
   title: t('createTask.timeline.urgentTitle', 'Urgent - Same Day'),
   description: t('createTask.timeline.urgentDesc', 'I need this done today'),
  },
  {
   value: 'within_week' as const,
   icon: '🟡',
   title: t('createTask.timeline.soonTitle', 'Soon - Within a Week'),
   description: t('createTask.timeline.soonDesc', 'I need this done in the next 7 days'),
  },
  {
   value: 'flexible' as const,
   icon: '🟢',
   title: t('createTask.timeline.flexibleTitle', 'Flexible'),
   description: t('createTask.timeline.flexibleDesc', "I'm flexible with timing"),
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
     <div className="grid md:grid-cols-3 gap-4">
      {urgencyOptions.map((option) => {
       const isSelected = field.state.value === option.value

       return (
        <Card
         key={option.value}
         isPressable
         isHoverable
         onPress={() => {
          field.handleChange(option.value)
          onUrgencyChange(option.value)
         }}
         className={`transition-all ${
          isSelected
           ? 'border-2 border-primary bg-primary-50'
           : 'border-2 border-transparent hover:border-gray-300'
         }`}
        >
         <CardBody className="p-4">
          <div className="text-3xl mb-2">{option.icon}</div>
          <h3 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
           {option.title}
          </h3>
          <p className="text-sm text-gray-600">{option.description}</p>
         </CardBody>
        </Card>
       )
      })}
     </div>
    )}
   </form.Field>

   {/* Specific Deadline (Optional) - Hidden for same_day urgency */}
   <form.Field name="deadline" key="deadline-field">
    {(field: any) => {
     // Get today's date in the user's local timezone
     const todayDate = today(getLocalTimeZone())

     // Convert stored JS Date to CalendarDate for display
     const displayValue = field.state.value
       ? (() => {
           const date = new Date(field.state.value)
           return {
             year: date.getFullYear(),
             month: date.getMonth() + 1,
             day: date.getDate(),
           }
         })()
       : null

     return (
      <DatePicker
       key="deadline-picker"
       label={t('createTask.timeline.deadlineLabel', 'Specific Deadline (Optional)')}
       description={t('createTask.timeline.deadlineHelp', "Leave empty if you don't have a specific deadline")}
       value={displayValue}
       onChange={(date: any) => {
        if (date) {
         // Create date at noon UTC to avoid timezone issues
         const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0))
         field.handleChange(jsDate)
        } else {
         field.handleChange(undefined)
        }
       }}
       minValue={todayDate}
       showMonthAndYearPickers
       labelPlacement="outside"
       isDisabled={urgency === 'same_day'}
       locale={dateLocale}
       classNames={{
        base: 'max-w-md',
        popoverContent: 'bg-white shadow-xl border border-gray-200 rounded-xl p-4',
        calendar: 'bg-white shadow-sm',
       }}
      />
     )
    }}
   </form.Field>
   </CardBody>
  </Card>
 )
}
