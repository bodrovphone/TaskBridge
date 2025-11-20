'use client'

import { Application } from '@/types/applications'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Divider,
  Textarea,
  RadioGroup,
  Radio,
  Input,
  Link
} from '@nextui-org/react'
import { CheckCircle, Wallet, Calendar, AlertTriangle, MessageSquare, Phone, Mail, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { getTimelineLabel } from '@/lib/utils/timeline'
import { maskPhoneNumber, maskEmail } from '@/lib/utils/privacy'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'
import { useIsMobile } from '@/hooks/use-is-mobile'

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isDismissable={!isSubmitting}
      hideCloseButton={true}
      size={isMobile ? "full" : "2xl"}
      placement={isMobile ? "center" : "center"}
      scrollBehavior="inside"
      classNames={{
        backdrop: 'bg-black/80',
        wrapper: isMobile ? 'items-stretch' : 'items-end sm:items-center',
        base: isMobile
          ? 'h-full max-h-full w-full m-0 rounded-none'
          : `${isKeyboardOpen ? 'max-h-[60vh]' : 'max-h-[90vh]'} sm:max-h-[90vh] my-auto transition-all duration-200`,
        header: 'border-b border-gray-200 flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 py-2 sm:px-6 sm:py-4',
        body: 'overflow-y-auto px-4 py-3 sm:px-6 sm:py-6',
        footer: 'border-t border-gray-200 flex-shrink-0 sticky bottom-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4'
      }}
      motionProps={{
        variants: isMobile ? {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          },
          exit: {
            x: '100%',
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }
        } : {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          },
          exit: {
            y: 20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isMobile && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
                  <h2 className="text-base sm:text-2xl font-bold">{t('acceptApplication.title')}</h2>
                </div>
                {/* Custom close button */}
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </ModalHeader>

            <ModalBody className="flex-1 overflow-y-auto overscroll-contain">
              {/* Hide description on mobile when keyboard is open */}
              {!(isMobile && isKeyboardOpen) && (
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                  {t('acceptApplication.description', { name: professional.name })}
                </p>
              )}

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

              {!(isMobile && isKeyboardOpen) && <Divider className="my-3 sm:my-4" />}

              {/* Message to Professional */}
              <div className="mb-4 sm:mb-6">
                <Textarea
                  label={t('acceptApplication.messageLabel')}
                  placeholder={t('acceptApplication.messagePlaceholder')}
                  value={message}
                  onValueChange={setMessage}
                  minRows={isKeyboardOpen ? 2 : 3}
                  maxRows={isKeyboardOpen ? 3 : 6}
                  description={!(isMobile && isKeyboardOpen) ? t('acceptApplication.messageHelp', { name: professional.name }) : undefined}
                  startContent={!(isMobile && isKeyboardOpen) ? <MessageSquare className="w-4 h-4 text-gray-400" /> : undefined}
                  isDisabled={isSubmitting}
                  classNames={{
                    label: 'font-medium text-sm',
                    input: 'text-base', // 16px font size prevents iOS zoom
                    description: 'text-xs'
                  }}
                />
              </div>

              {!(isMobile && isKeyboardOpen) && <Divider className="my-3 sm:my-4" />}

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
                      isDisabled={isSubmitting}
                      classNames={{
                        wrapper: 'gap-3'
                      }}
                    >
                      {userProfile?.phone && (
                        <Radio value="phone" classNames={{ label: 'text-sm' }}>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{t('acceptApplication.sharePhone')}: <strong>{maskPhoneNumber(userProfile.phone)}</strong></span>
                          </div>
                          <p className="text-xs text-gray-500 ml-6 mt-1">
                            {t('acceptApplication.phoneWarning')} <Link href="/privacy-policy" size="sm" className="text-xs" target="_blank">{t('acceptApplication.privacyPolicy')}</Link>
                          </p>
                        </Radio>
                      )}

                      {userProfile?.email && (
                        <Radio value="email" classNames={{ label: 'text-sm' }}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{t('acceptApplication.shareEmail')}: <strong>{maskEmail(userProfile.email)}</strong></span>
                          </div>
                          <p className="text-xs text-amber-600 ml-6 mt-1">
                            ⚠️ {t('acceptApplication.emailWarning')}
                          </p>
                        </Radio>
                      )}

                      <Radio value="custom" classNames={{ label: 'text-sm' }}>
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          <span>{t('acceptApplication.customContact')}</span>
                        </div>
                      </Radio>
                    </RadioGroup>

                    {contactMethod === 'custom' && (
                      <div className="mt-3">
                        <Input
                          label={t('acceptApplication.customContactLabel')}
                          placeholder={t('acceptApplication.customContactPlaceholder')}
                          value={customContact}
                          onValueChange={setCustomContact}
                          description={!(isMobile && isKeyboardOpen) ? t('acceptApplication.customContactHelp') : undefined}
                          isRequired
                          isDisabled={isSubmitting}
                          classNames={{
                            label: 'text-sm font-medium',
                            input: 'text-base', // 16px font size prevents iOS zoom
                            description: 'text-xs'
                          }}
                        />
                        {!customContact.trim() && !(isMobile && isKeyboardOpen) && (
                          <p className="text-xs text-red-600 mt-2">
                            {t('acceptApplication.customContactRequired')}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // No phone/email - just show input field directly
                  <div>
                    <Input
                      label={t('acceptApplication.customContactLabel')}
                      placeholder={t('acceptApplication.customContactPlaceholder')}
                      value={customContact}
                      onValueChange={setCustomContact}
                      description={!(isMobile && isKeyboardOpen) ? t('acceptApplication.customContactHelp') : undefined}
                      isRequired
                      isDisabled={isSubmitting}
                      classNames={{
                        label: 'text-sm font-medium',
                        input: 'text-base', // 16px font size prevents iOS zoom
                        description: 'text-xs'
                      }}
                    />
                    {!customContact.trim() && !(isMobile && isKeyboardOpen) && (
                      <p className="text-xs text-red-600 mt-2">
                        {t('acceptApplication.customContactRequired')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!(isMobile && isKeyboardOpen) && <Divider className="my-3 sm:my-4" />}

              {/* Agreement Checklist - hide on mobile when keyboard is open */}
              {!(isMobile && isKeyboardOpen) && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg">{t('acceptApplication.pleaseConfirm')}</h4>

                  <Checkbox
                    isSelected={agreements.priceTimeline}
                    onValueChange={(checked) =>
                      setAgreements((prev) => ({ ...prev, priceTimeline: checked }))
                    }
                    isDisabled={isSubmitting}
                    classNames={{
                      label: 'text-xs sm:text-sm'
                    }}
                  >
                    {t('acceptApplication.agreement.priceTimeline', {
                      price: proposedPrice,
                      currency,
                      timeline: readableTimeline
                    })}
                  </Checkbox>

                  <Checkbox
                    isSelected={agreements.contactSharing}
                    onValueChange={(checked) =>
                      setAgreements((prev) => ({ ...prev, contactSharing: checked }))
                    }
                    isDisabled={isSubmitting}
                    classNames={{
                      label: 'text-xs sm:text-sm'
                    }}
                  >
                    {t('acceptApplication.agreement.contactSharing', { name: professional.name })}
                  </Checkbox>

                  <Checkbox
                    isSelected={agreements.otherApplications}
                    onValueChange={(checked) =>
                      setAgreements((prev) => ({ ...prev, otherApplications: checked }))
                    }
                    isDisabled={isSubmitting}
                    classNames={{
                      label: 'text-xs sm:text-sm'
                    }}
                  >
                    {t('acceptApplication.agreement.otherApplications')}
                  </Checkbox>
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
            </ModalBody>

            <ModalFooter className="flex-row gap-2">
              <Button
                variant="solid"
                onPress={handleClose}
                isDisabled={isSubmitting}
                size={isMobile ? "md" : "lg"}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1 sm:flex-initial sm:w-auto"
              >
                {t('acceptApplication.cancel')}
              </Button>
              <Button
                variant="solid"
                color="success"
                onPress={handleConfirm}
                isDisabled={!canConfirm}
                isLoading={isSubmitting}
                size={isMobile ? "md" : "lg"}
                startContent={!isSubmitting && <CheckCircle className="w-4 h-4" />}
                className="flex-1 sm:flex-initial sm:w-auto"
              >
                {isSubmitting ? t('acceptApplication.accepting', 'Accepting...') : t('acceptApplication.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
