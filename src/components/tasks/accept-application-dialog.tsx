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
import { CheckCircle, Wallet, Calendar, AlertTriangle, MessageSquare, Phone, Mail, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { getTimelineLabel } from '@/lib/utils/timeline'
import { maskPhoneNumber, maskEmail } from '@/lib/utils/privacy'

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
  const canConfirm = allAgreed && hasValidContact

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(application.id, {
        method: contactMethod,
        customContact: contactMethod === 'custom' ? customContact : undefined
      })
      // Reset state for next time
      setMessage('')
      setCustomContact('')
      setAgreements({
        priceTimeline: false,
        contactSharing: false,
        otherApplications: false
      })
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
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'max-h-[90vh] sm:max-h-[90vh]',
        body: 'py-6',
        wrapper: 'items-end sm:items-center'
      }}
      motionProps={{
        variants: {
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
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold">{t('acceptApplication.title')}</h2>
              </div>
            </ModalHeader>

            <ModalBody>
              <p className="text-gray-700 mb-4">
                {t('acceptApplication.description', { name: professional.name })}
              </p>

              {/* Price & Timeline Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
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

              <Divider className="my-4" />

              {/* Message to Professional */}
              <div className="mb-6">
                <Textarea
                  label={t('acceptApplication.messageLabel')}
                  placeholder={t('acceptApplication.messagePlaceholder')}
                  value={message}
                  onValueChange={setMessage}
                  minRows={3}
                  maxRows={6}
                  description={t('acceptApplication.messageHelp', { name: professional.name })}
                  startContent={<MessageSquare className="w-4 h-4 text-gray-400" />}
                  classNames={{
                    label: 'font-medium',
                    input: 'text-base', // 16px font size prevents iOS zoom
                    description: 'text-xs'
                  }}
                />
              </div>

              <Divider className="my-4" />

              {/* Contact Information Selection */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-lg">{t('acceptApplication.contactInfo')}</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    ℹ️ {t('acceptApplication.noInAppChat')}
                  </p>
                </div>

                {/* If user has phone/email, show radio options */}
                {(userProfile?.phone || userProfile?.email) ? (
                  <>
                    <RadioGroup
                      value={contactMethod}
                      onValueChange={(value) => setContactMethod(value as 'phone' | 'email' | 'custom')}
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
                          description={t('acceptApplication.customContactHelp')}
                          isRequired
                          classNames={{
                            label: 'text-sm font-medium',
                            input: 'text-base', // 16px font size prevents iOS zoom
                            description: 'text-xs'
                          }}
                        />
                        {!customContact.trim() && (
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
                      description={t('acceptApplication.customContactHelp')}
                      isRequired
                      classNames={{
                        label: 'text-sm font-medium',
                        input: 'text-base', // 16px font size prevents iOS zoom
                        description: 'text-xs'
                      }}
                    />
                    {!customContact.trim() && (
                      <p className="text-xs text-red-600 mt-2">
                        {t('acceptApplication.customContactRequired')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Divider className="my-4" />

              {/* Agreement Checklist */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">{t('acceptApplication.pleaseConfirm')}</h4>

                <Checkbox
                  isSelected={agreements.priceTimeline}
                  onValueChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, priceTimeline: checked }))
                  }
                  classNames={{
                    label: 'text-sm'
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
                  classNames={{
                    label: 'text-sm'
                  }}
                >
                  {t('acceptApplication.agreement.contactSharing', { name: professional.name })}
                </Checkbox>

                <Checkbox
                  isSelected={agreements.otherApplications}
                  onValueChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, otherApplications: checked }))
                  }
                  classNames={{
                    label: 'text-sm'
                  }}
                >
                  {t('acceptApplication.agreement.otherApplications')}
                </Checkbox>
              </div>

              {/* Warning */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">{t('important')}:</span> {t('acceptApplication.warning', { name: professional.name })}
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="bordered" onPress={handleClose}>
                {t('acceptApplication.cancel')}
              </Button>
              <Button
                color="success"
                onPress={handleConfirm}
                isDisabled={!canConfirm}
                startContent={<CheckCircle className="w-4 h-4" />}
              >
                {t('acceptApplication.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
