'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import {
 Modal,
 ModalContent,
 ModalHeader,
 ModalBody,
 ModalFooter,
 Button,
 Input,
 Select,
 SelectItem,
 Textarea,
 Chip,
} from '@nextui-org/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Check,
 Wallet,
 Clock,
 MessageSquare,
 Sparkles,
 Calendar,
 Zap,
 ArrowRight,
 AlertCircle,
 X,
} from 'lucide-react'
import type { ApplicationFormData } from './types'
import { TIMELINE_OPTIONS } from './types'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { NotificationSetupChip } from '@/components/ui/notification-setup-chip'

interface ApplicationDialogProps {
 isOpen: boolean
 onClose: () => void
 taskId: string
 taskTitle: string
 taskBudget?: { min?: number; max?: number }
}

// Timeline options with proper translation keys
const TIMELINE_DISPLAY = {
 today: 'application.timelineToday',
 'within-3-days': 'application.timeline3days',
 'within-week': 'application.timelineWeek',
 flexible: 'application.timelineFlexible',
} as const

export default function ApplicationDialog({
 isOpen,
 onClose,
 taskId,
 taskTitle,
 taskBudget,
}: ApplicationDialogProps) {
 const { t, i18n } = useTranslation()
 const router = useRouter()
 const { user } = useAuth()
 const isKeyboardOpen = useKeyboardHeight()
 const isMobile = useIsMobile() // < 640px (sm breakpoint)
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [isSuccess, setIsSuccess] = useState(false)
 const [applicationId, setApplicationId] = useState<string | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [alreadyApplied, setAlreadyApplied] = useState(false)
 const [showNotificationWarning, setShowNotificationWarning] = useState(false)
 const [bannerDismissed, setBannerDismissed] = useState(false)

 const form = useForm({
  defaultValues: {
   proposedPrice: 0,
   timeline: '',
   message: '',
  },
  onSubmit: async ({ value }: { value: ApplicationFormData }) => {
   setIsSubmitting(true)
   setError(null)

   try {
    // Convert timeline to estimated hours
    const timelineHoursMap: Record<string, number> = {
      'today': 8,
      'within-3-days': 24,
      'within-week': 40,
      'flexible': 80
    }

    const response = await fetch('/api/applications', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        proposedPrice: value.proposedPrice,
        estimatedDurationHours: timelineHoursMap[value.timeline] || null,
        message: value.message || null,
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit application')
    }

    // Show success
    setApplicationId(data.application.id)
    setIsSuccess(true)
   } catch (err) {
    console.error('Application submission error:', err)
    setError(err instanceof Error ? err.message : 'Failed to submit application')
   } finally {
    setIsSubmitting(false)
   }
  },
 })

 // Check notification status when user is available and modal is open
 useEffect(() => {
  if (user?.id && isOpen) {
   fetch(`/api/users/${user.id}/notification-channel`)
    .then(res => res.json())
    .then(data => {
     setShowNotificationWarning(data.showWarning || false)
    })
    .catch(error => {
     console.error('Failed to check notification channel:', error)
     setShowNotificationWarning(false)
    })
  }
 }, [user?.id, isOpen])

 const handleClose = () => {
  // Prevent closing while submitting (unless on success screen)
  if (isSubmitting && !isSuccess) {
   return
  }

  // Reset form state
  form.reset()
  setIsSuccess(false)
  setApplicationId(null)
  setError(null)
  setAlreadyApplied(false)
  setBannerDismissed(false)
  onClose()
 }

 const handleBrowseOther = () => {
  handleClose()
  const currentLang = i18n.language || 'bg'
  router.push(`/${currentLang}/browse-tasks`)
 }

 const handleViewApplication = () => {
  handleClose()
  const currentLang = i18n.language || 'bg'
  router.push(`/${currentLang}/tasks/applications`)
 }

 // Handle notification setup action
 const handleSetupNotifications = () => {
  // Navigate to profile page where notification setup is available
  const currentLang = i18n.language || 'bg'
  router.push(`/${currentLang}/profile`)
  handleClose()
 }

 const handleDismissBanner = () => {
  setBannerDismissed(true)
 }

 // Validation helpers
 const containsPhoneNumber = (text: string): boolean => {
  // Remove all common separators to catch formatted numbers like "0 88 44 892 89"
  const normalized = text.replace(/[\s\-._*()\[\]]/g, '')

  // Match phone numbers: 10 digits (Bulgaria), or +359 followed by 9 digits, or other patterns
  const phoneRegex = /(\+?\d{1,3}\d{9,11})|\b0\d{9}\b|\b\d{10}\b/g
  return phoneRegex.test(normalized)
 }

 const containsUrl = (text: string): boolean => {
  // Matches URLs and common patterns to bypass detection
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z0-9]+\.(com|net|org|bg|info|io|co|me|online)[^\s]*)/gi
  // Also catch attempts like "dot com", "gmail dot com", etc.
  const dotComRegex = /\b(dot|d0t)\s*(com|net|org|bg|info)\b/gi
  return urlRegex.test(text) || dotComRegex.test(text)
 }

 const containsEmail = (text: string): boolean => {
  // Matches email addresses and common obfuscation attempts
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
  const atRegex = /\b(at|@|а)\s*(gmail|yahoo|hotmail|abv|mail)/gi
  return emailRegex.test(text) || atRegex.test(text)
 }

 // Track form state for button validation
 const [formValues, setFormValues] = useState({
   proposedPrice: 0,
   timeline: '',
   message: ''
 })

 // Update tracked values when form changes
 useEffect(() => {
   const unsubscribe = form.store.subscribe(() => {
     setFormValues(form.state.values)
   })
   return unsubscribe
 }, [form.store, form.state.values])

 // Character count for message
 const messageLength = formValues.message?.length || 0
 const messageMax = 500
 const messageProgress = (messageLength / messageMax) * 100

 // Button state logic
 // Price must be explicitly set (not initial 0) OR be a non-zero value OR be exactly 0 if field was touched
 // For simplicity: just check if timeline is filled (price has default 0 which is valid for volunteering)
 const hasTimeline = formValues.timeline.length > 0
 const hasValidPrice = typeof formValues.proposedPrice === 'number' && formValues.proposedPrice >= 0
 // Message is optional - just check it's not too long and doesn't contain forbidden content
 const hasValidMessage = messageLength <= 500 &&
   !containsPhoneNumber(formValues.message || '') &&
   !containsUrl(formValues.message || '') &&
   !containsEmail(formValues.message || '')

 const isFormValid = hasValidPrice && hasTimeline && hasValidMessage

 // Button color based on form state
 const getButtonColor = () => {
  if (alreadyApplied) return 'default'
  if (isFormValid) return 'success' // Green when all valid
  if (hasValidPrice || hasTimeline || messageLength > 0) return 'warning' // Orange when partially filled
  return 'danger' // Red when empty
 }

 return (
  <Modal
   isOpen={isOpen}
   onClose={handleClose}
   onOpenChange={(open) => !open && handleClose()}
   isDismissable={!isSubmitting}
   hideCloseButton={true}
   size={isMobile ? "full" : "2xl"}
   placement={isMobile ? "center" : "center"}
   scrollBehavior="inside"
   backdrop="blur"
   classNames={{
    backdrop: 'bg-black/80',
    wrapper: isMobile ? 'items-stretch' : '',
    base: isMobile
      ? 'h-full max-h-full w-full m-0 rounded-none border-0'
      : `border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 ${isKeyboardOpen ? 'max-h-[60vh]' : 'max-h-[95vh]'} sm:max-h-[90vh] my-auto transition-all duration-200`,
    header: 'border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 py-2 sm:px-6 sm:py-4',
    body: 'overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4',
    footer: 'border-t border-gray-200 dark:border-gray-800 sticky bottom-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4',
   }}
   motionProps={{
    variants: isMobile ? {
     enter: {
      x: 0,
      opacity: 1,
      transition: {
       duration: 0.3,
       ease: 'easeOut',
      },
     },
     exit: {
      x: '100%',
      opacity: 0,
      transition: {
       duration: 0.2,
       ease: 'easeIn',
      },
     },
    } : {
     enter: {
      y: 0,
      opacity: 1,
      transition: {
       duration: 0.3,
       ease: 'easeOut',
      },
     },
     exit: {
      y: -20,
      opacity: 0,
      transition: {
       duration: 0.2,
       ease: 'easeIn',
      },
     },
    },
   }}
  >
   <ModalContent>
    <AnimatePresence mode="wait">
     {!isSuccess ? (
      <motion.div
       key="form"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       transition={{ duration: 0.3 }}
      >
       <ModalHeader className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3">
         {!isMobile && (
           <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
           </div>
         )}
         <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white">
           {t('application.title')}
          </h2>
          {!(isMobile && isKeyboardOpen) && (
            <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
             {taskTitle}
            </p>
          )}
         </div>
         {/* Custom close button */}
         <button
          onClick={handleClose}
          disabled={isSubmitting && !isSuccess}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Close"
         >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
         </button>
        </div>
       </ModalHeader>

       <ModalBody className="gap-6 py-4 sm:py-6">
        <form
         id="application-form"
         onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
         }}
         className="space-y-6 relative"
        >
         {/* Loading overlay while submitting */}
         {isSubmitting && !isSuccess && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
           <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
             {t('application.submitting')}
            </p>
           </div>
          </div>
         )}

         {error && (
          <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
          >
           <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
           <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            {error}
           </p>
          </motion.div>
         )}

         {alreadyApplied && (
          <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3"
          >
           <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
           <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            {t('application.alreadyApplied')}
           </p>
          </motion.div>
         )}

         {/* Notification Setup Chip - hide on mobile when keyboard is open */}
         {showNotificationWarning && !bannerDismissed && !(isMobile && isKeyboardOpen) && (
          <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.2 }}
          >
           <NotificationSetupChip
            onSetup={handleSetupNotifications}
            onDismiss={handleDismissBanner}
           />
          </motion.div>
         )}

         {/* Proposed Price */}
         <form.Field
          name="proposedPrice"
          validators={{
           onChange: ({ value }) => {
            if (value < 0) {
             return t('application.errors.priceMin')
            }
            return undefined
           },
          }}
         >
          {(field) => (
           <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             {t('application.proposedPrice')} <span className="text-danger">*</span>
            </label>
            <Input
             placeholder={t('application.pricePlaceholder')}
             type="number"
             min="0"
             step="0.01"
             value={field.state.value?.toString() || ''}
             onChange={(e) =>
              field.handleChange(parseFloat(e.target.value) || 0)
             }
             onBlur={field.handleBlur}
             isInvalid={field.state.meta.errors.length > 0}
             errorMessage={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
             endContent={
              <div className="pointer-events-none flex items-center">
               <span className="text-default-400 text-sm font-semibold">
                BGN
               </span>
              </div>
             }
             classNames={{
              input: 'text-base',
              inputWrapper: 'h-12',
             }}
             variant="bordered"
            />
            {taskBudget && (taskBudget.min !== undefined || taskBudget.max !== undefined) && !(isMobile && isKeyboardOpen) && (
             <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-start gap-2 mt-2">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
               {t('application.tipClientBudget', { min: taskBudget.min ?? 0, max: taskBudget.max ?? 0 })}
              </p>
             </div>
            )}
           </div>
          )}
         </form.Field>

         {/* Timeline */}
         <form.Field
          name="timeline"
          validators={{
           onChange: ({ value }) => {
            if (!value || value.length === 0) {
             return t('application.errors.timelineRequired')
            }
            return undefined
           },
          }}
         >
          {(field) => (
           <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             {t('application.timeline')} <span className="text-danger">*</span>
            </label>
            <Select
             placeholder={t('application.timeline')}
             selectedKeys={field.state.value ? [field.state.value] : []}
             onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string
              field.handleChange(value)
             }}
             onBlur={field.handleBlur}
             isInvalid={field.state.meta.errors.length > 0}
             errorMessage={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
             classNames={{
              trigger: 'h-14',
             }}
             variant="bordered"
             startContent={<Clock className="w-4 h-4 text-gray-500" />}
            >
             {TIMELINE_OPTIONS.map((option) => (
              <SelectItem
               key={option}
               value={option}
               startContent={
                option === 'today' ? (
                 <Zap className="w-4 h-4 text-orange-500" />
                ) : option === 'within-3-days' ? (
                 <Clock className="w-4 h-4 text-blue-500" />
                ) : option === 'within-week' ? (
                 <Calendar className="w-4 h-4 text-green-500" />
                ) : (
                 <Sparkles className="w-4 h-4 text-purple-500" />
                )
               }
              >
               {t(TIMELINE_DISPLAY[option])}
              </SelectItem>
             ))}
            </Select>
           </div>
          )}
         </form.Field>

         {/* Application Message */}
         <form.Field
          name="message"
          validators={{
           onChange: ({ value }) => {
            if (value && value.length > 500) {
             return t('application.errors.messageMax')
            }
            if (value && containsPhoneNumber(value)) {
             return t('application.errors.noPhoneNumbers')
            }
            if (value && containsUrl(value)) {
             return t('application.errors.noUrls')
            }
            if (value && containsEmail(value)) {
             return t('application.errors.noEmails')
            }
            return undefined
           },
          }}
         >
          {(field) => (
           <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             {t('application.message')} <span className="text-gray-400 text-sm">({t('common.optional', 'Optional')})</span>
            </label>
            <Textarea
             placeholder={t('application.messagePlaceholder')}
             value={field.state.value || ''}
             onChange={(e) => field.handleChange(e.target.value)}
             onBlur={field.handleBlur}
             isInvalid={field.state.meta.errors.length > 0}
             errorMessage={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
             minRows={isKeyboardOpen ? 2 : 3}
             maxRows={isKeyboardOpen ? 3 : 8}
             variant="bordered"
             classNames={{
              input: 'text-base' // 16px font size prevents iOS zoom
             }}
             description={!(isMobile && isKeyboardOpen) ? (
              <div className="flex items-center justify-between mt-2">
               <span
                className={`text-xs font-medium transition-colors ${
                 messageLength > messageMax
                  ? 'text-danger'
                  : 'text-default-400'
                }`}
               >
                {t('application.characterCount', {
                 current: messageLength,
                 max: messageMax,
                })}
               </span>
               {messageLength > 0 && (
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                 <motion.div
                  className={`h-full rounded-full ${
                   messageLength > messageMax
                    ? 'bg-danger'
                    : 'bg-primary'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(messageProgress, 100)}%` }}
                  transition={{ duration: 0.2 }}
                 />
                </div>
               )}
              </div>
             ) : undefined}
            />
            {!(isMobile && isKeyboardOpen) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
               <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
               <p className="text-xs text-blue-700 dark:text-blue-300">
                {t('application.messageInfo')}
               </p>
              </div>
            )}
           </div>
          )}
         </form.Field>
        </form>
       </ModalBody>

       <ModalFooter className="flex-row gap-2">
        <Button
         color="default"
         variant="flat"
         onPress={handleClose}
         isDisabled={isSubmitting}
         size={isMobile ? "md" : "lg"}
         className="font-semibold flex-1 sm:flex-initial sm:w-auto"
        >
         {t('application.cancel')}
        </Button>
        <Button
         color={getButtonColor()}
         type="submit"
         form="application-form"
         isLoading={isSubmitting}
         isDisabled={alreadyApplied || !isFormValid}
         size={isMobile ? "md" : "lg"}
         variant="bordered"
         className="font-semibold transition-colors duration-300 flex-1 sm:flex-initial sm:w-auto"
         endContent={
          !isSubmitting && <ArrowRight className="w-4 h-4" />
         }
        >
         {isSubmitting
          ? t('application.submitting')
          : t('application.submit')}
        </Button>
       </ModalFooter>
      </motion.div>
     ) : (
      <motion.div
       key="success"
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.9 }}
       transition={{ duration: 0.3 }}
       className="relative"
      >
       {/* Confetti Effect */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
         <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full"
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

       <ModalHeader className="flex flex-col items-center gap-4 pt-6 px-4 pb-4 sm:pt-8 sm:px-6 sm:pb-6">
        <motion.div
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
         }}
         className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center border-4 border-green-200 dark:border-green-800 shadow-lg"
        >
         <Check className="text-green-600 dark:text-green-400 w-10 h-10 stroke-[3]" />
        </motion.div>
        <div className="text-center">
         <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('application.success')}
         </h2>
        </div>
       </ModalHeader>

       <ModalBody className="py-4 sm:py-6">
        <div className="text-center space-y-6">
         <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-800">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
           {t('application.successMessage')}
          </p>
         </div>

         <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
           <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
           </div>
           <p className="text-xs text-gray-600 dark:text-gray-400">{t('application.successSteps.quickReview')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
           <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
           </div>
           <p className="text-xs text-gray-600 dark:text-gray-400">{t('application.successSteps.getResponse')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
           <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
           </div>
           <p className="text-xs text-gray-600 dark:text-gray-400">{t('application.successSteps.startWork')}</p>
          </div>
         </div>
        </div>
       </ModalBody>

       <ModalFooter className="flex-row gap-2">
        <Button
         color="default"
         variant="bordered"
         onPress={handleViewApplication}
         className="flex-1 sm:flex-initial sm:w-auto font-semibold"
         size={isMobile ? "md" : "lg"}
        >
         {t('application.viewApplication')}
        </Button>
        <Button
         color="primary"
         variant="solid"
         onPress={handleBrowseOther}
         className="flex-1 sm:flex-initial sm:w-auto font-semibold"
         size={isMobile ? "md" : "lg"}
         endContent={<ArrowRight className="w-4 h-4" />}
        >
         {t('application.browseOther')}
        </Button>
       </ModalFooter>
      </motion.div>
     )}
    </AnimatePresence>
   </ModalContent>
  </Modal>
 )
}
