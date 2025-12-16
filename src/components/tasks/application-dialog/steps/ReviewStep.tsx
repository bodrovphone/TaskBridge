'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Wallet, Clock, MessageSquare, Check, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Timeline display translation keys
const TIMELINE_DISPLAY = {
  today: 'application.timelineToday',
  'within-week': 'application.timelineWeek',
  flexible: 'application.timelineFlexible',
} as const

interface ReviewStepProps {
  proposedPrice: number | undefined
  timeline: string
  message: string
  taskTitle: string
  onEditPrice: () => void
  onEditTimeline: () => void
  onEditMessage: () => void
}

export function ReviewStep({
  proposedPrice,
  timeline,
  message,
  taskTitle,
  onEditPrice,
  onEditTimeline,
  onEditMessage,
}: ReviewStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('application.wizard.reviewHelp', 'Please review your application before submitting.')}
      </p>

      {/* Task reference */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t('application.wizard.applyingTo', 'Applying to')}
        </p>
        <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
          {taskTitle}
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        {/* Price */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('application.proposedPrice')}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {proposedPrice ?? 0} <span className="text-sm font-medium">€</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditPrice}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('application.timeline')}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {timeline ? t(TIMELINE_DISPLAY[timeline as keyof typeof TIMELINE_DISPLAY] || timeline) : '-'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditTimeline}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('application.message')}
                </p>
                {message ? (
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 line-clamp-3">
                    {message}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-1">
                    {t('application.wizard.noMessage', 'No message added')}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onEditMessage}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {t('application.wizard.readyToSubmit', 'Ready to submit!')}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {t('application.wizard.submitNote', 'Click Submit to send your application. The client will be notified.')}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ReviewStep
