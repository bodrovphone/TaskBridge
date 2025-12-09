'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MessageSquare, Lightbulb } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface AddMessageStepProps {
  message: string
  onMessageChange: (value: string) => void
  professionalName: string
  disabled?: boolean
  maxLength?: number
  isMobile?: boolean
  isKeyboardOpen?: boolean
}

export function AddMessageStep({
  message,
  onMessageChange,
  professionalName,
  disabled = false,
  maxLength = 500,
  isMobile = false,
  isKeyboardOpen = false,
}: AddMessageStepProps) {
  const { t } = useTranslation()
  const charCount = message.length

  // Hide tips when keyboard is open on mobile to keep action buttons visible
  const showTips = !(isMobile && isKeyboardOpen)

  return (
    <div className="space-y-4">
      {showTips && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('acceptApplication.wizard.messageHelp', 'Add a personal message for {{name}} (optional).', { name: professionalName })}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          {t('acceptApplication.messageLabel')}
        </Label>
        <Textarea
          id="message"
          placeholder={t('acceptApplication.messagePlaceholder')}
          value={message}
          onChange={(e) => onMessageChange(e.target.value.slice(0, maxLength))}
          rows={isMobile && isKeyboardOpen ? 3 : 4}
          disabled={disabled}
          className="text-base resize-none rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
          style={{ fontSize: '16px' }}
        />
        <div className="flex justify-end">
          <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </span>
        </div>
      </motion.div>

      {/* Tips - hidden when keyboard is open on mobile */}
      {showTips && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('acceptApplication.wizard.messageTipTitle', 'Quick tips')}
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                <li>{t('acceptApplication.wizard.messageTip1', '• Mention when you\'re available')}</li>
                <li>{t('acceptApplication.wizard.messageTip2', '• Ask any last questions')}</li>
                <li>{t('acceptApplication.wizard.messageTip3', '• Share relevant details about the task')}</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AddMessageStep
