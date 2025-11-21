'use client'

import { Application } from '@/types/applications'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Wallet, Calendar, AlertTriangle, MessageSquare, Phone, Mail, Send, X } from 'lucide-react'
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
  const isMobile = useIsMobile() // < 640px (sm breakpoint)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'custom'>('phone')
  const [customContact, setCustomContact] = useState('')
  const [agreements, setAgreements] = useState({
    priceTimeline: false,
    contactSharing: false,
    otherApplications: false
  })

  const bodyRef = useRef<HTMLDivElement>(null)

  // Handle input focus on mobile - scroll into view
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isMobile && bodyRef.current) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300) // Wait for keyboard animation
    }
  }

  // Auto-select custom if user has no phone
  useEffect(() => {
    if (!userProfile?.phone && isOpen) {
      setContactMethod('custom')
    } else if (isOpen) {
      setContactMethod('phone')
    }
  }, [userProfile?.phone, isOpen])

  if (!application) return null

  const { professional, proposedPrice, currency, timeline } = application
  const readableTimeline = getTimelineLabel(timeline, t)

  // Validation
  const hasValidContact = contactMethod === 'custom'
    ? customContact.trim().length > 0
    : true

  const allAgreed = agreements.priceTimeline && agreements.contactSharing && agreements.otherApplications
  const canConfirm = allAgreed && hasValidContact && !isSubmitting

  const handleConfirm = async () => {
    if (canConfirm) {
      setIsSubmitting(true)
      try {
        // Call the async onConfirm handler
        await onConfirm(application.id, {
          method: contactMethod,
          customContact: contactMethod === 'custom' ? customContact : undefined
        })

        // Only reset state after successful submission
        setMessage('')
        setCustomContact('')
        setAgreements({
          priceTimeline: false,
          contactSharing: false,
          otherApplications: false
        })
      } catch (error) {
        console.error('Error accepting application:', error)
        // Don't reset form on error - let user try again
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    // Reset state when closing
    setMessage('')
    setCustomContact('')
    setAgreements({
      priceTimeline: false,
      contactSharing: false,
      otherApplications: false
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-w-2xl p-0 gap-0 bg-white dark:bg-gray-900 flex flex-col",
          isMobile ? "h-full max-h-full w-full rounded-none" : "rounded-xl",
          !isMobile && isKeyboardOpen && "max-h-[60vh]",
          !isMobile && !isKeyboardOpen && "max-h-[90vh]"
        )}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
      >
        {/* Header - compact on mobile when keyboard is open */}
        <DialogHeader className={cn(
          "border-b border-gray-200 flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-gray-900",
          isMobile && isKeyboardOpen ? "px-4 py-2" : "px-4 py-2 sm:px-6 sm:py-4",
          !isMobile && "rounded-t-xl"
        )}>
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              {!isMobile && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
              <DialogTitle className={cn(
                "font-bold",
                isMobile && isKeyboardOpen ? "text-sm" : "text-base sm:text-2xl"
              )}>
                {t('acceptApplication.title')}
              </DialogTitle>
            </div>
          </div>
          {!(isMobile && isKeyboardOpen) && (
            <DialogDescription className="text-sm sm:text-base text-gray-700 mt-2">
              {t('acceptApplication.description', { name: professional.name })}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Body */}
        <div
          ref={bodyRef}
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain",
            isMobile && isKeyboardOpen ? "px-4 py-2" : "px-4 py-3 sm:px-6 sm:py-6"
          )}
        >
          {/* Price & Timeline Summary - hide on mobile when keyboard is open */}
              {!(isMobile && isKeyboardOpen) && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('acceptApplication.agreedPrice')}</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {proposedPrice} {currency}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('acceptApplication.timeline')}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">{readableTimeline}</div>
                </div>
              </div>
              )}

          {!(isMobile && isKeyboardOpen) && <hr className="my-3 sm:my-4 border-gray-200" />}

          {/* Message to Professional */}
          <div className="mb-4 sm:mb-6">
            <div className="space-y-2">
              <Label htmlFor="message" className="font-medium text-sm flex items-center gap-2">
                {!(isMobile && isKeyboardOpen) && <MessageSquare className="w-4 h-4 text-gray-400" />}
                {t('acceptApplication.messageLabel')}
              </Label>
              <Textarea
                id="message"
                placeholder={t('acceptApplication.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={handleInputFocus}
                rows={isKeyboardOpen ? 2 : 3}
                disabled={isSubmitting}
                className="text-base resize-none"
                style={{ fontSize: '16px' }} // Prevents iOS zoom
              />
              {!(isMobile && isKeyboardOpen) && (
                <p className="text-xs text-gray-500">
                  {t('acceptApplication.messageHelp', { name: professional.name })}
                </p>
              )}
            </div>
          </div>

          {!(isMobile && isKeyboardOpen) && <hr className="my-3 sm:my-4 border-gray-200" />}

          {/* Contact Information Selection */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <h4 className="font-semibold text-base sm:text-lg">{t('acceptApplication.contactInfo')}</h4>
            {/* Hide info banner on mobile when keyboard is open */}
            {!(isMobile && isKeyboardOpen) && (
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  ℹ️ {t('acceptApplication.noInAppChat')}
                </p>
              </div>
            )}

            {/* If user has phone/email, show radio options */}
            {(userProfile?.phone || userProfile?.email) ? (
              <>
                <RadioGroup
                  value={contactMethod}
                  onValueChange={(value) => setContactMethod(value as 'phone' | 'email' | 'custom')}
                  disabled={isSubmitting}
                  className="gap-3"
                >
                  {userProfile?.phone && (
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="phone" id="radio-phone" />
                      <Label htmlFor="radio-phone" className="text-sm cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{t('acceptApplication.sharePhone')}: <strong>{maskPhoneNumber(userProfile.phone)}</strong></span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6 mt-1">
                          {t('acceptApplication.phoneWarning')} <a href="/privacy-policy" className="text-xs text-blue-600 underline" target="_blank" rel="noopener noreferrer">{t('acceptApplication.privacyPolicy')}</a>
                        </p>
                      </Label>
                    </div>
                  )}

                  {userProfile?.email && (
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="email" id="radio-email" />
                      <Label htmlFor="radio-email" className="text-sm cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{t('acceptApplication.shareEmail')}: <strong>{maskEmail(userProfile.email)}</strong></span>
                        </div>
                        <p className="text-xs text-amber-600 ml-6 mt-1">
                          ⚠️ {t('acceptApplication.emailWarning')}
                        </p>
                      </Label>
                    </div>
                  )}

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="custom" id="radio-custom" />
                    <Label htmlFor="radio-custom" className="text-sm cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>{t('acceptApplication.customContact')}</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {contactMethod === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="custom-contact" className="text-sm font-medium">
                      {t('acceptApplication.customContactLabel')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="custom-contact"
                      placeholder={t('acceptApplication.customContactPlaceholder')}
                      value={customContact}
                      onChange={(e) => setCustomContact(e.target.value)}
                      onFocus={handleInputFocus}
                      disabled={isSubmitting}
                      className="text-base"
                      style={{ fontSize: '16px' }} // Prevents iOS zoom
                    />
                    {!(isMobile && isKeyboardOpen) && (
                      <p className="text-xs text-gray-500">
                        {t('acceptApplication.customContactHelp')}
                      </p>
                    )}
                    {!customContact.trim() && !(isMobile && isKeyboardOpen) && (
                      <p className="text-xs text-red-600">
                        {t('acceptApplication.customContactRequired')}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              // No phone/email - just show input field directly
              <div className="space-y-2">
                <Label htmlFor="custom-contact" className="text-sm font-medium">
                  {t('acceptApplication.customContactLabel')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="custom-contact"
                  placeholder={t('acceptApplication.customContactPlaceholder')}
                  value={customContact}
                  onChange={(e) => setCustomContact(e.target.value)}
                  onFocus={handleInputFocus}
                  disabled={isSubmitting}
                  className="text-base"
                  style={{ fontSize: '16px' }} // Prevents iOS zoom
                />
                {!(isMobile && isKeyboardOpen) && (
                  <p className="text-xs text-gray-500">
                    {t('acceptApplication.customContactHelp')}
                  </p>
                )}
                {!customContact.trim() && !(isMobile && isKeyboardOpen) && (
                  <p className="text-xs text-red-600">
                    {t('acceptApplication.customContactRequired')}
                  </p>
                )}
              </div>
            )}
          </div>

          {!(isMobile && isKeyboardOpen) && <hr className="my-3 sm:my-4 border-gray-200" />}

          {/* Agreement Checklist - hide on mobile when keyboard is open */}
          {!(isMobile && isKeyboardOpen) && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-base sm:text-lg">{t('acceptApplication.pleaseConfirm')}</h4>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree-price"
                  checked={agreements.priceTimeline}
                  onCheckedChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, priceTimeline: checked as boolean }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="agree-price" className="text-xs sm:text-sm cursor-pointer">
                  {t('acceptApplication.agreement.priceTimeline', {
                    price: proposedPrice,
                    currency,
                    timeline: readableTimeline
                  })}
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree-contact"
                  checked={agreements.contactSharing}
                  onCheckedChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, contactSharing: checked as boolean }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="agree-contact" className="text-xs sm:text-sm cursor-pointer">
                  {t('acceptApplication.agreement.contactSharing', { name: professional.name })}
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree-applications"
                  checked={agreements.otherApplications}
                  onCheckedChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, otherApplications: checked as boolean }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="agree-applications" className="text-xs sm:text-sm cursor-pointer">
                  {t('acceptApplication.agreement.otherApplications')}
                </Label>
              </div>
            </div>
          )}

          {/* Warning - hide on mobile when keyboard is open */}
          {!(isMobile && isKeyboardOpen) && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-amber-800">
                    <span className="font-semibold">{t('important')}:</span> {t('acceptApplication.warning', { name: professional.name })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - hide on mobile when keyboard is open */}
        {!(isMobile && isKeyboardOpen) && (
          <DialogFooter className={cn(
            "border-t border-gray-200 flex-shrink-0 sticky bottom-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4",
            !isMobile && "rounded-b-xl"
          )}>
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                size={isMobile ? "default" : "lg"}
                className="flex-1 sm:flex-initial sm:w-auto"
              >
                {t('acceptApplication.cancel')}
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={!canConfirm}
                size={isMobile ? "default" : "lg"}
                className="flex-1 sm:flex-initial sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t('acceptApplication.accepting', 'Accepting...')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('acceptApplication.confirm')}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
