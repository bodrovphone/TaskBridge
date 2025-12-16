'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CheckCircle, User, Phone, MessageSquare, ClipboardCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Application } from '@/types/applications'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { WizardDialog, type WizardStep } from '@/components/ui/wizard-dialog'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'
import { cn } from '@/lib/utils'

import {
  ReviewApplicationStep,
  ShareContactStep,
  AddMessageStep,
  ConfirmStep,
} from './accept-application-dialog/steps'

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
  const isMobile = useIsMobile()
  const isKeyboardOpen = useKeyboardHeight()

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'custom'>('custom')
  const [customContact, setCustomContact] = useState('')
  const [contactSharingAgreed, setContactSharingAgreed] = useState(false)

  // Check if user has any saved contact methods
  const hasPhone = Boolean(userProfile?.phone)
  const hasEmail = Boolean(userProfile?.email)

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

  // Extract application data with defaults for when application is null
  const professional = application?.professional ?? { name: '', avatar: null }
  const proposedPrice = application?.proposedPrice ?? 0
  const currency = application?.currency ?? 'EUR'
  const timeline = application?.timeline ?? ''
  const applicationMessage = application?.message ?? null
  const applicationId = application?.id ?? ''

  // Validation
  const hasValidContact = contactMethod === 'custom'
    ? customContact.trim().length > 0
    : true

  // Navigation helpers for Confirm step edit buttons
  // Note: WizardDialog manages its own step state, so this is currently a no-op
  // @todo: Make WizardDialog controllable to enable edit button navigation
  const goToStep = useCallback((_step: number) => {
    // Will be implemented when WizardDialog supports controlled mode
  }, [])

  const handleConfirm = useCallback(async () => {
    if (contactSharingAgreed && hasValidContact && !isSubmitting && application) {
      setIsSubmitting(true)
      try {
        await onConfirm(applicationId, {
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
  }, [contactSharingAgreed, hasValidContact, isSubmitting, application, applicationId, contactMethod, customContact, message, onConfirm])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose()
    }
  }, [isSubmitting, onClose])

  // Build wizard steps
  const steps: WizardStep[] = useMemo(() => [
    {
      id: 'review',
      title: t('acceptApplication.wizard.reviewTitle', 'Review Offer'),
      subtitle: t('acceptApplication.wizard.reviewSubtitle', 'Professional\'s proposal'),
      icon: <User className="w-4 h-4 text-blue-600" />,
      content: (
        <ReviewApplicationStep
          professional={professional}
          proposedPrice={proposedPrice}
          currency={currency}
          timeline={timeline}
          message={applicationMessage}
        />
      ),
      isValid: () => true,
    },
    {
      id: 'contact',
      title: t('acceptApplication.wizard.contactTitle', 'Share Contact'),
      subtitle: t('acceptApplication.wizard.contactSubtitle', 'How to reach you'),
      icon: <Phone className="w-4 h-4 text-green-600" />,
      content: (
        <ShareContactStep
          userProfile={userProfile}
          contactMethod={contactMethod}
          onContactMethodChange={setContactMethod}
          customContact={customContact}
          onCustomContactChange={setCustomContact}
          disabled={isSubmitting}
        />
      ),
      isValid: () => hasValidContact,
    },
    {
      id: 'message',
      title: t('acceptApplication.wizard.messageTitle', 'Add Message'),
      subtitle: t('acceptApplication.wizard.messageSubtitle', 'Optional note'),
      icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
      isOptional: true,
      content: (
        <AddMessageStep
          message={message}
          onMessageChange={setMessage}
          professionalName={professional.name}
          disabled={isSubmitting}
          isMobile={isMobile}
          isKeyboardOpen={isKeyboardOpen}
        />
      ),
      isValid: () => true,
    },
    {
      id: 'confirm',
      title: t('acceptApplication.wizard.confirmTitle', 'Confirm'),
      subtitle: t('acceptApplication.wizard.confirmSubtitle', 'Final review'),
      icon: <ClipboardCheck className="w-4 h-4 text-green-600" />,
      content: (
        <ConfirmStep
          professional={professional}
          proposedPrice={proposedPrice}
          currency={currency}
          timeline={timeline}
          contactMethod={contactMethod}
          customContact={customContact}
          userProfile={userProfile}
          message={message}
          contactSharingAgreed={contactSharingAgreed}
          onContactSharingChange={setContactSharingAgreed}
          onEditContact={() => goToStep(1)}
          onEditMessage={() => goToStep(2)}
          disabled={isSubmitting}
        />
      ),
      isValid: () => contactSharingAgreed && hasValidContact,
    },
  ], [
    t,
    professional,
    proposedPrice,
    currency,
    timeline,
    applicationMessage,
    userProfile,
    contactMethod,
    customContact,
    message,
    contactSharingAgreed,
    hasValidContact,
    isSubmitting,
    isMobile,
    isKeyboardOpen,
    goToStep,
  ])

  // Early return AFTER all hooks
  if (!application) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        hideCloseButton
        className={cn(
          'max-w-lg p-0 gap-0 !bg-transparent flex flex-col overflow-hidden border-0',
          isMobile
            ? 'h-full max-h-full w-full rounded-none !inset-0 !translate-x-0 !translate-y-0'
            : '!rounded-2xl max-h-[90vh]'
        )}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
      >
        <AnimatePresence mode="wait">
          <WizardDialog
            key="accept-wizard"
            steps={steps}
            onComplete={handleConfirm}
            onClose={handleClose}
            isSubmitting={isSubmitting}
            submitText={t('acceptApplication.confirm', 'Accept')}
            isMobile={isMobile}
            headerGradient="from-green-500 to-green-600"
            headerIcon={<CheckCircle className="w-5 h-5 text-white" />}
            title={t('acceptApplication.title')}
            subtitle={t('acceptApplication.description', { name: professional.name })}
          />
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
