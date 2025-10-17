'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, DatePicker } from '@nextui-org/react'
import { UseFormReturn } from 'react-hook-form'
import { parseDate } from '@internationalized/date'
import { CreateTaskFormData } from '../lib/validation'

interface TimelineSectionProps {
  form: UseFormReturn<CreateTaskFormData>
  urgency: 'same_day' | 'within_week' | 'flexible'
}

export function TimelineSection({ form, urgency }: TimelineSectionProps) {
  const { t } = useTranslation()
  const { setValue, watch } = form

  const deadline = watch('deadline')

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
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('createTask.timeline.title', 'When do you need this done?')}
        </h2>
        <p className="text-gray-600">
          {t('createTask.timeline.subtitle', 'Let professionals know your timeline')}
        </p>
      </div>

      {/* Urgency Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {urgencyOptions.map((option) => {
          const isSelected = urgency === option.value

          return (
            <Card
              key={option.value}
              isPressable
              isHoverable
              onPress={() => setValue('urgency', option.value)}
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

      {/* Specific Deadline (Optional) - Hidden for same_day urgency */}
      {urgency !== 'same_day' && (
        <DatePicker
          label={t('createTask.timeline.deadlineLabel', 'Specific Deadline (Optional)')}
          description={t('createTask.timeline.deadlineHelp', "Leave empty if you don't have a specific deadline")}
          value={deadline ? parseDate(deadline.toISOString().split('T')[0]) : null}
          onChange={(date) => {
            if (date) {
              const jsDate = new Date(date.year, date.month - 1, date.day)
              setValue('deadline', jsDate)
            } else {
              setValue('deadline', undefined)
            }
          }}
          minValue={parseDate(new Date().toISOString().split('T')[0])}
          showMonthAndYearPickers
          classNames={{
            base: 'max-w-md',
          }}
        />
      )}
    </div>
  )
}
