'use client'

import { Application } from '@/types/applications'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@nextui-org/react'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Wallet, Calendar, MessageSquare, Phone, Mail, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { getTimelineLabel } from '@/lib/utils/timeline'
import { maskPhoneNumber, maskEmail } from '@/lib/utils/privacy'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@/lib/utils'

interface UserProfile {
  phone?: string | null
  email?: string | null
  telegram_username?: string | null
}

interface AcceptApplicationDialogProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, contactInfo: ContactInfo) => void
  userProfile?: UserProfile | null
}

interface ContactInfo {
  method: 'phone' | 'email' | 'custom'
  customContact?: string
  message?: string
}

export default function AcceptApplicationDialog({
  application,
  isOpen,
  onClose,
  onConfirm,
  userProfile
}: AcceptApplicationDialogProps) {
  const { t } = useTranslation()
  const isKeyboardOpen = useKeyboardHeight()
  const isMobile = useIsMobile()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'custom'>('custom')
  const [customContact, setCustomContact] = useState('')
  const [contactSharingAgreed, setContactSharingAgreed] = useState(false)

  const bodyRef = useRef<HTMLDivElement>(null)

  // Check if user has any saved contact methods
  const hasPhone = Boolean(userProfile?.phone)
  const hasEmail = Boolean(userProfile?.email)
  const hasSavedContacts = hasPhone || hasEmail

  // Handle input focus on mobile - scroll into view
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isMobile && bodyRef.current) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

  // Set default contact method based on available options
  useEffect(() => {
    if (isOpen) {
      if (hasPhone) {
        setContactMethod('phone')
      } else if (hasEmail) {
        setContactMethod('email')
      } else {
        setContactMethod('custom')
      }
    }
  }, [hasPhone, hasEmail, isOpen])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMessage('')
      setCustomContact('')
      setContactSharingAgreed(false)
    }
  }, [isOpen])

  if (!application) return null

  const { professional, proposedPrice, currency, timeline } = application
  const readableTimeline = getTimelineLabel(timeline, t)

  // Validation
  const hasValidContact = contactMethod === 'custom'
    ? customContact.trim().length > 0
    : true

  const canConfirm = contactSharingAgreed && hasValidContact && !isSubmitting

  const handleConfirm = async () => {
    if (canConfirm) {
      setIsSubmitting(true)
      try {
        await onConfirm(application.id, {
          method: contactMethod,
          customContact: contactMethod === 'custom' ? customContact : undefined,
          message: message.trim() || undefined
        })
      } catch (error) {
        console.error('Error accepting application:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-w-lg p-0 gap-0 bg-white dark:bg-gray-900 flex flex-col overflow-hidden",
          isMobile
            ? "h-full max-h-full w-full rounded-none !inset-0 !translate-x-0 !translate-y-0"
            : "rounded-2xl max-h-[90vh]"
        )}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
      >
        {/* Header */}
        <DialogHeader className={cn(
          "flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 text-white",
          isMobile && isKeyboardOpen ? "px-4 py-3" : "px-5 py-4 sm:px-6 sm:py-5"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white">
                {t('acceptApplication.title')}
              </DialogTitle>
              {!(isMobile && isKeyboardOpen) && (
                <DialogDescription className="text-sm text-green-100 mt-0.5">
                  {t('acceptApplication.description', { name: professional.name })}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div
          ref={bodyRef}
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain",
            isMobile && isKeyboardOpen ? "px-4 py-3" : "px-5 py-4 sm:px-6 sm:py-5"
          )}
        >
          {/* Price & Timeline Summary */}
          {!(isMobile && isKeyboardOpen) && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">{t('acceptApplication.agreedPrice')}</span>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {proposedPrice} {currency}
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">{t('acceptApplication.timeline')}</span>
                </div>
                <div className="text-lg font-bold text-blue-700">{readableTimeline}</div>
              </div>
            </div>
          )}

          {/* Message to Professional (Optional) */}
          <div className="mb-5">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              {t('acceptApplication.messageLabel')}
              <span className="text-xs text-gray-400 font-normal">({t('common.optional', 'optional')})</span>
            </Label>
            <Textarea
              id="message"
              placeholder={t('acceptApplication.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={handleInputFocus}
              rows={2}
              disabled={isSubmitting}
              className="text-base resize-none rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Contact Information Section */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t('acceptApplication.contactInfo')}
            </h4>

            {hasSavedContacts ? (
              // User has saved contacts - show radio options
              <div className="space-y-2">
                <RadioGroup
                  value={contactMethod}
                  onValueChange={(value) => setContactMethod(value as 'phone' | 'email' | 'custom')}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {hasPhone && (
                    <label
                      htmlFor="radio-phone"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        contactMethod === 'phone'
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <RadioGroupItem value="phone" id="radio-phone" className="sr-only" />
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        contactMethod === 'phone' ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {t('acceptApplication.sharePhone')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {maskPhoneNumber(userProfile!.phone!)}
                        </div>
                      </div>
                      {contactMethod === 'phone' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </label>
                  )}

                  {hasEmail && (
                    <label
                      htmlFor="radio-email"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        contactMethod === 'email'
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <RadioGroupItem value="email" id="radio-email" className="sr-only" />
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        contactMethod === 'email' ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {t('acceptApplication.shareEmail')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {maskEmail(userProfile!.email!)}
                        </div>
                      </div>
                      {contactMethod === 'email' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </label>
                  )}

                  <label
                    htmlFor="radio-custom"
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                      contactMethod === 'custom'
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <RadioGroupItem value="custom" id="radio-custom" className="sr-only" />
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      contactMethod === 'custom' ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {t('acceptApplication.customContact')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('acceptApplication.customContactHelp')}
                      </div>
                    </div>
                    {contactMethod === 'custom' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </label>
                </RadioGroup>

                {/* Custom contact input - shown when custom is selected */}
                {contactMethod === 'custom' && (
                  <div className="mt-3 pl-11">
                    <Input
                      id="custom-contact"
                      placeholder={t('acceptApplication.customContactPlaceholder')}
                      value={customContact}
                      onChange={(e) => setCustomContact(e.target.value)}
                      onFocus={handleInputFocus}
                      disabled={isSubmitting}
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
                  </div>
                )}
              </div>
            ) : (
              // No saved contacts - show input directly
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-600 mb-3">
                    {t('acceptApplication.noSavedContacts', 'Please provide a way for the professional to contact you.')}
                  </p>
                  <Input
                    id="custom-contact-direct"
                    placeholder={t('acceptApplication.customContactPlaceholder')}
                    value={customContact}
                    onChange={(e) => setCustomContact(e.target.value)}
                    onFocus={handleInputFocus}
                    disabled={isSubmitting}
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
                </div>
              </div>
            )}
          </div>

          {/* Single Confirmation Checkbox */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agree-contact"
                checked={contactSharingAgreed}
                onCheckedChange={(checked) => setContactSharingAgreed(checked as boolean)}
                disabled={isSubmitting}
                className="mt-0.5"
              />
              <Label htmlFor="agree-contact" className="text-sm text-amber-800 cursor-pointer leading-relaxed">
                {t('acceptApplication.agreement.contactSharing', { name: professional.name })}
              </Label>
            </div>
          </div>
        </div>

        {/* Footer - Always visible */}
        <div className={cn(
          "flex-shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:px-6",
          isMobile ? "pb-safe" : ""
        )}>
          <div className="flex gap-3">
            <Button
              variant="flat"
              color="default"
              onPress={handleClose}
              isDisabled={isSubmitting}
              className="flex-1 font-medium"
              size="lg"
            >
              {t('acceptApplication.cancel')}
            </Button>
            <Button
              color="success"
              onPress={handleConfirm}
              isDisabled={!canConfirm}
              isLoading={isSubmitting}
              className="flex-1 font-medium"
              size="lg"
              startContent={!isSubmitting && <CheckCircle className="w-4 h-4" />}
            >
              {isSubmitting
                ? t('acceptApplication.accepting', 'Accepting...')
                : t('acceptApplication.confirm')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
