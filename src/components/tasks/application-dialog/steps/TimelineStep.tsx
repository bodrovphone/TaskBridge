'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Zap, Clock, Calendar, Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIMELINE_OPTIONS } from '../../types'

// Timeline display translation keys
const TIMELINE_DISPLAY = {
  today: 'application.timelineToday',
  'within-3-days': 'application.timeline3days',
  'within-week': 'application.timelineWeek',
  flexible: 'application.timelineFlexible',
} as const

const TIMELINE_DESCRIPTIONS = {
  today: 'application.wizard.timelineDescToday',
  'within-3-days': 'application.wizard.timelineDesc3days',
  'within-week': 'application.wizard.timelineDescWeek',
  flexible: 'application.wizard.timelineDescFlexible',
} as const

interface TimelineStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

function TimelineIcon({ option, isSelected }: { option: string; isSelected: boolean }) {
  const iconClass = cn('w-6 h-6', isSelected ? 'text-white' : '')

  switch (option) {
    case 'today':
      return <Zap className={cn(iconClass, !isSelected && 'text-orange-500')} />
    case 'within-3-days':
      return <Clock className={cn(iconClass, !isSelected && 'text-blue-500')} />
    case 'within-week':
      return <Calendar className={cn(iconClass, !isSelected && 'text-green-500')} />
    default:
      return <Sparkles className={cn(iconClass, !isSelected && 'text-purple-500')} />
  }
}

function getTimelineColor(option: string): string {
  switch (option) {
    case 'today':
      return 'bg-orange-500'
    case 'within-3-days':
      return 'bg-blue-500'
    case 'within-week':
      return 'bg-green-500'
    default:
      return 'bg-purple-500'
  }
}

export function TimelineStep({
  value,
  onChange,
  error,
}: TimelineStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('application.wizard.timelineHelp', 'When can you complete this task? Choose the option that best fits your availability.')}
      </p>

      <div className="space-y-3">
        {TIMELINE_OPTIONS.map((option) => {
          const isSelected = value === option
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    isSelected ? getTimelineColor(option) : 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <TimelineIcon option={option} isSelected={isSelected} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-semibold',
                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                  )}>
                    {t(TIMELINE_DISPLAY[option])}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t(TIMELINE_DESCRIPTIONS[option], '')}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

export default TimelineStep
