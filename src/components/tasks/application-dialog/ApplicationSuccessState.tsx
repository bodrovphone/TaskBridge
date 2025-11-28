'use client'

import { motion } from 'framer-motion'
import { Check, Clock, MessageSquare, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ApplicationSuccessStateProps {
  isMobile: boolean
  onViewApplication: () => void
  onBrowseOther: () => void
}

/**
 * Success state shown after successful application submission.
 * Features confetti animation and next-steps guidance.
 * (Radix UI version)
 */
export function ApplicationSuccessState({
  isMobile,
  onViewApplication,
  onBrowseOther,
}: ApplicationSuccessStateProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden',
        !isMobile && 'rounded-2xl'
      )}
    >
      {/* Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full"
            initial={{
              x: '50%',
              y: '50%',
              opacity: 1,
              scale: 0,
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 100}%`,
              y: `${50 + (Math.random() - 0.5) * 100}%`,
              opacity: 0,
              scale: 1,
            }}
            transition={{
              duration: 1 + Math.random(),
              ease: 'easeOut',
              delay: i * 0.02,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div
        className="flex-shrink-0 flex flex-col items-center gap-4 pt-6 px-4 pb-4 sm:pt-8 sm:px-6 sm:pb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg"
        >
          <Check className="text-white w-10 h-10 stroke-[3]" />
        </motion.div>
        <DialogTitle className="text-2xl sm:text-3xl font-bold !text-white text-center">
          {t('application.success')}
        </DialogTitle>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-6">
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {t('application.successMessage')}
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 text-center">
            <SuccessStep
              icon={<Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              iconBgClass="bg-blue-100 dark:bg-blue-900/30"
              text={t('application.successSteps.quickReview')}
            />
            <SuccessStep
              icon={<MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
              iconBgClass="bg-purple-100 dark:bg-purple-900/30"
              text={t('application.successSteps.getResponse')}
            />
            <SuccessStep
              icon={<Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
              iconBgClass="bg-green-100 dark:bg-green-900/30"
              text={t('application.successSteps.startWork')}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={cn(
          'flex-shrink-0 border-t border-gray-100 bg-gray-50 dark:bg-gray-800',
          isMobile ? 'px-4 py-3 pb-safe' : 'px-5 py-4 sm:px-6'
        )}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onViewApplication}
            className="w-full sm:flex-1 font-semibold h-11"
          >
            {t('application.viewApplication')}
          </Button>
          <Button
            onClick={onBrowseOther}
            className="w-full sm:flex-1 font-semibold h-11 bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {t('application.browseOther')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

interface SuccessStepProps {
  icon: React.ReactNode
  iconBgClass: string
  text: string
}

function SuccessStep({ icon, iconBgClass, text }: SuccessStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className={`w-10 h-10 mx-auto mb-2 rounded-full ${iconBgClass} flex items-center justify-center`}>
        {icon}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  )
}
