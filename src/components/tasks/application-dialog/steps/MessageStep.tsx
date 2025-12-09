'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  containsPhoneNumber,
  containsUrl,
  containsEmail,
  MESSAGE_MAX_LENGTH,
} from '../validation'

interface MessageStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
}

export function MessageStep({
  value,
  onChange,
  error,
  onFocus,
}: MessageStepProps) {
  const { t } = useTranslation()
  const [isFocused, setIsFocused] = useState(false)

  const messageLength = value?.length || 0
  const messageProgress = (messageLength / MESSAGE_MAX_LENGTH) * 100

  // Validation for display
  const hasPhoneNumber = containsPhoneNumber(value || '')
  const hasUrl = containsUrl(value || '')
  const hasEmail = containsEmail(value || '')
  const isTooLong = messageLength > MESSAGE_MAX_LENGTH

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('application.message')}{' '}
          <span className="text-gray-400 font-normal">({t('common.optional', 'Optional')})</span>
        </Label>
        <Textarea
          id="message"
          placeholder={t('application.messagePlaceholder')}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={() => setIsFocused(false)}
          rows={5}
          className={cn(
            'text-base rounded-xl resize-none',
            error && 'border-red-500 focus:ring-red-500'
          )}
          style={{ fontSize: '16px' }}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>

      {/* Character counter */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium transition-colors',
            isTooLong ? 'text-red-500' : 'text-gray-400'
          )}
        >
          {t('application.characterCount', { current: messageLength, max: MESSAGE_MAX_LENGTH })}
        </span>
        {messageLength > 0 && (
          <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', isTooLong ? 'bg-red-500' : 'bg-blue-600')}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(messageProgress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </div>

      {/* Validation warnings */}
      {(hasPhoneNumber || hasUrl || hasEmail) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-300">
            {hasPhoneNumber && <p>{t('application.errors.noPhoneNumbers')}</p>}
            {hasUrl && <p>{t('application.errors.noUrls')}</p>}
            {hasEmail && <p>{t('application.errors.noEmails')}</p>}
          </div>
        </div>
      )}

      {/* Info box - hidden when keyboard is likely open (input focused) */}
      {!isFocused && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t('application.wizard.messageTitle', 'Why write a message?')}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {t('application.messageInfo')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageStep
