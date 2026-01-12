'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Wallet, Calendar, MessageSquare, User } from 'lucide-react'
import { Avatar } from '@heroui/react'
import { getTimelineLabel } from '@/lib/utils/timeline'

interface ReviewApplicationStepProps {
  professional: {
    name: string
    avatar?: string | null
  }
  proposedPrice: number
  currency: string
  timeline: string
  message?: string | null
}

export function ReviewApplicationStep({
  professional,
  proposedPrice,
  currency,
  timeline,
  message,
}: ReviewApplicationStepProps) {
  const t = useTranslations()
  const readableTimeline = getTimelineLabel(timeline, t)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('acceptApplication.wizard.reviewHelp')}
      </p>

      {/* Professional info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <Avatar
          src={professional.avatar || undefined}
          name={professional.name}
          size="lg"
          classNames={{
            base: "flex-shrink-0",
            icon: "text-gray-400",
          }}
          fallback={<User className="w-6 h-6 text-gray-400" />}
        />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('acceptApplication.wizard.professional')}
          </p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {professional.name}
          </p>
        </div>
      </motion.div>

      {/* Price & Timeline cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl"
        >
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-medium">
              {t('acceptApplication.wizard.proposedPrice')}
            </span>
          </div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">
            {proposedPrice} {currency}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl"
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">
              {t('acceptApplication.wizard.timeline')}
            </span>
          </div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {readableTimeline}
          </div>
        </motion.div>
      </div>

      {/* Professional's message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">
              {t('acceptApplication.wizard.professionalMessage')}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default ReviewApplicationStep
