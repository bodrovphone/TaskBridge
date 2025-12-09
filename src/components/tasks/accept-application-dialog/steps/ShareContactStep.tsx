'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Phone, Mail, Send, CheckCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { maskPhoneNumber, maskEmail } from '@/lib/utils/privacy'
import { cn } from '@/lib/utils'

interface UserProfile {
  phone?: string | null
  email?: string | null
  telegram_username?: string | null
}

interface ShareContactStepProps {
  userProfile?: UserProfile | null
  contactMethod: 'phone' | 'email' | 'custom'
  onContactMethodChange: (method: 'phone' | 'email' | 'custom') => void
  customContact: string
  onCustomContactChange: (value: string) => void
  disabled?: boolean
}

export function ShareContactStep({
  userProfile,
  contactMethod,
  onContactMethodChange,
  customContact,
  onCustomContactChange,
  disabled = false,
}: ShareContactStepProps) {
  const { t } = useTranslation()

  const hasPhone = Boolean(userProfile?.phone)
  const hasEmail = Boolean(userProfile?.email)
  const hasSavedContacts = hasPhone || hasEmail

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('acceptApplication.wizard.contactHelp', 'Choose how the professional can contact you.')}
      </p>

      {hasSavedContacts ? (
        <div className="space-y-2">
          <RadioGroup
            value={contactMethod}
            onValueChange={(value) => onContactMethodChange(value as 'phone' | 'email' | 'custom')}
            disabled={disabled}
            className="gap-2"
          >
            {hasPhone && (
              <motion.label
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                htmlFor="radio-phone"
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  contactMethod === 'phone'
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <RadioGroupItem value="phone" id="radio-phone" className="sr-only" />
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  contactMethod === 'phone'
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                )}>
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {t('acceptApplication.sharePhone')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {maskPhoneNumber(userProfile!.phone!)}
                  </div>
                </div>
                {contactMethod === 'phone' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </motion.label>
            )}

            {hasEmail && (
              <motion.label
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                htmlFor="radio-email"
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  contactMethod === 'email'
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <RadioGroupItem value="email" id="radio-email" className="sr-only" />
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  contactMethod === 'email'
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                )}>
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {t('acceptApplication.shareEmail')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {maskEmail(userProfile!.email!)}
                  </div>
                </div>
                {contactMethod === 'email' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </motion.label>
            )}

            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              htmlFor="radio-custom"
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                contactMethod === 'custom'
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <RadioGroupItem value="custom" id="radio-custom" className="sr-only" />
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                contactMethod === 'custom'
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              )}>
                <Send className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {t('acceptApplication.customContact')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('acceptApplication.customContactHelp')}
                </div>
              </div>
              {contactMethod === 'custom' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </motion.label>
          </RadioGroup>

          {/* Custom contact input */}
          {contactMethod === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pl-14"
            >
              <Input
                id="custom-contact"
                placeholder={t('acceptApplication.customContactPlaceholder')}
                value={customContact}
                onChange={(e) => onCustomContactChange(e.target.value)}
                disabled={disabled}
                className={cn(
                  "text-base rounded-xl",
                  !customContact.trim() && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                style={{ fontSize: '16px' }}
              />
              {!customContact.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  {t('acceptApplication.customContactRequired')}
                </p>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        // No saved contacts - show input directly
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {t('acceptApplication.noSavedContacts', 'Please provide a way for the professional to contact you.')}
          </p>
          <Input
            id="custom-contact-direct"
            placeholder={t('acceptApplication.customContactPlaceholder')}
            value={customContact}
            onChange={(e) => onCustomContactChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "text-base rounded-xl",
              !customContact.trim() && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            style={{ fontSize: '16px' }}
          />
          {!customContact.trim() && (
            <p className="text-xs text-red-500 mt-2">
              {t('acceptApplication.customContactRequired')}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ShareContactStep
