'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Wallet, Calendar, Phone, Mail, Send, MessageSquare, Edit2, Check, AlertTriangle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getTimelineLabel } from '@/lib/utils/timeline'
import { maskPhoneNumber, maskEmail } from '@/lib/utils/privacy'
import { cn } from '@/lib/utils'

interface UserProfile {
  phone?: string | null
  email?: string | null
}

interface ConfirmStepProps {
  professional: {
    name: string
  }
  proposedPrice: number
  currency: string
  timeline: string
  contactMethod: 'phone' | 'email' | 'custom'
  customContact: string
  userProfile?: UserProfile | null
  message: string
  contactSharingAgreed: boolean
  onContactSharingChange: (agreed: boolean) => void
  onEditContact: () => void
  onEditMessage: () => void
  disabled?: boolean
}

export function ConfirmStep({
  professional,
  proposedPrice,
  currency,
  timeline,
  contactMethod,
  customContact,
  userProfile,
  message,
  contactSharingAgreed,
  onContactSharingChange,
  onEditContact,
  onEditMessage,
  disabled = false,
}: ConfirmStepProps) {
  const t = useTranslations()
  const readableTimeline = getTimelineLabel(timeline, t)

  // Get contact display value
  const getContactDisplay = () => {
    switch (contactMethod) {
      case 'phone':
        return {
          icon: Phone,
          label: t('acceptApplication.sharePhone'),
          value: maskPhoneNumber(userProfile?.phone || ''),
        }
      case 'email':
        return {
          icon: Mail,
          label: t('acceptApplication.shareEmail'),
          value: maskEmail(userProfile?.email || ''),
        }
      case 'custom':
        return {
          icon: Send,
          label: t('acceptApplication.customContact'),
          value: customContact,
        }
    }
  }

  const contact = getContactDisplay()
  const ContactIcon = contact.icon

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('acceptApplication.wizard.confirmHelp')}
      </p>

      {/* Summary cards */}
      <div className="space-y-3">
        {/* Price & Timeline - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium">{t('acceptApplication.agreedPrice')}</span>
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {proposedPrice} {currency}
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">{t('acceptApplication.timeline')}</span>
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {readableTimeline}
            </div>
          </div>
        </motion.div>

        {/* Contact method - Editable */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <ContactIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('acceptApplication.wizard.sharingContact')}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{contact.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{contact.value}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditContact}
              disabled={disabled}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Message - Editable */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('acceptApplication.wizard.yourMessage')}
                </p>
                {message ? (
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 line-clamp-2">
                    {message}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-1">
                    {t('acceptApplication.wizard.noMessage')}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onEditMessage}
              disabled={disabled}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Agreement checkbox */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "p-4 rounded-xl border-2 transition-colors",
          contactSharingAgreed
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id="agree-contact"
            checked={contactSharingAgreed}
            onCheckedChange={(checked) => onContactSharingChange(checked as boolean)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label htmlFor="agree-contact" className={cn(
            "text-sm cursor-pointer leading-relaxed",
            contactSharingAgreed
              ? "text-green-800 dark:text-green-200"
              : "text-amber-800 dark:text-amber-200"
          )}>
            {t('acceptApplication.agreement.contactSharing', { name: professional.name })}
          </Label>
        </div>
      </motion.div>

      {/* Ready indicator */}
      {contactSharingAgreed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('acceptApplication.wizard.readyToAccept')}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {t('acceptApplication.wizard.acceptNote', { name: professional.name })}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t('acceptApplication.wizard.agreementRequired')}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {t('acceptApplication.wizard.pleaseAgree')}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ConfirmStep
