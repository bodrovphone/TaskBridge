'use client'

import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Chip, Input, Select, SelectItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, Mail, Calendar, Shield, Globe, MessageSquare, User as UserIcon, Edit, X, Save, AlertCircle, Send } from 'lucide-react'
import { extractLocaleFromPathname } from '@/lib/utils/url-locale'
import { UserProfile, PreferredContact, PreferredLanguage } from '@/server/domain/user/user.types'
import { getCityLabelBySlug } from '@/features/cities'
import { useAuth } from '@/features/auth'
import { CityAutocomplete, CityOption } from '@/components/ui/city-autocomplete'

interface PersonalInfoSectionProps {
  profile: UserProfile
  onSave: (data: {
    name: string
    phone: string
    location: string
    preferredLanguage: PreferredLanguage
    preferredContact: PreferredContact
  }) => Promise<void>
  onSettingsOpen?: () => void // Optional callback to open settings modal
}

export function PersonalInfoSection({ profile, onSave, onSettingsOpen }: PersonalInfoSectionProps) {
  const { t } = useTranslation()
  const { authenticatedFetch } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showTelegramDisconnectDialog, setShowTelegramDisconnectDialog] = useState(false)
  const [pendingContactChange, setPendingContactChange] = useState<PreferredContact | null>(null)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const pathname = usePathname()
  const currentLocale = extractLocaleFromPathname(pathname) ?? 'bg'

  // Check if user has Telegram connected
  const hasTelegramConnected = !!profile.telegramId

  // Check if Telegram banner is dismissed (for showing bottom email banner)
  const [telegramBannerDismissed, setTelegramBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegram_banner_dismissed') === 'true'
    }
    return false
  })

  // Listen for changes to localStorage (when banner is dismissed)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        setTelegramBannerDismissed(localStorage.getItem('telegram_banner_dismissed') === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also check periodically in case of same-tab changes
    const interval = setInterval(handleStorageChange, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Form for personal information editing
  const personalForm = useForm({
    defaultValues: {
      name: profile.fullName || '',
      email: profile.email,
      phone: profile.phoneNumber || null,
      location: profile.city || null,
      preferredLanguage: profile.preferredLanguage,
      preferredContact: profile.preferredContact,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      setErrorMessage(null) // Clear previous errors

      try {
        await onSave({
          name: value.name,
          phone: value.phone || '',
          location: value.location || '',
          preferredLanguage: value.preferredLanguage,
          preferredContact: value.preferredContact,
        })
        setIsEditing(false)
      } catch (err: any) {
        console.error('Profile update error:', err)
        // Display user-friendly error message
        setErrorMessage(err.message || 'Failed to update profile. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  })

  const handleCancel = () => {
    personalForm.reset()
    setIsEditing(false)
    setErrorMessage(null) // Clear errors on cancel
    setShowTelegramDisconnectDialog(false)
    setPendingContactChange(null)
  }

  // Handle Telegram disconnection
  const handleDisconnectTelegram = async () => {
    try {
      setIsLoading(true)

      // Call API to disconnect Telegram
      const response = await authenticatedFetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: profile.id })
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect Telegram')
      }

      // If there was a pending contact change, apply it now
      if (pendingContactChange) {
        personalForm.setFieldValue('preferredContact', pendingContactChange)

        // Update the profile via parent's onSave to sync the state
        await onSave({
          name: personalForm.getFieldValue('name'),
          phone: personalForm.getFieldValue('phone') || '',
          location: personalForm.getFieldValue('location') || '',
          preferredLanguage: personalForm.getFieldValue('preferredLanguage'),
          preferredContact: pendingContactChange
        })
      }

      // Close dialog and reset state
      setShowTelegramDisconnectDialog(false)
      setPendingContactChange(null)

      // Exit edit mode to show updated view
      setIsEditing(false)
    } catch (err) {
      console.error('Error disconnecting Telegram:', err)
      setErrorMessage(t('profile.telegram.disconnectError', 'Failed to disconnect Telegram. Please try again.'))
      setShowTelegramDisconnectDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancelling Telegram disconnection
  const handleCancelDisconnect = () => {
    setShowTelegramDisconnectDialog(false)
    setPendingContactChange(null)
    // Keep Telegram selected
    personalForm.setFieldValue('preferredContact', 'telegram')
  }

  // Handle email verification resend
  const handleResendVerification = async () => {
    setIsResendingVerification(true)
    setVerificationMessage(null)

    try {
      const response = await authenticatedFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes('already verified')) {
          setVerificationMessage({ type: 'success', text: t('auth.emailVerification.alreadyVerified', 'Your email is already verified!') })
        } else if (response.status === 429) {
          setVerificationMessage({ type: 'error', text: t('auth.emailVerification.rateLimited', 'Too many requests. Please try again later.') })
        } else {
          setVerificationMessage({ type: 'error', text: data.error || t('auth.emailVerification.error', 'Failed to send verification email.') })
        }
      } else {
        setVerificationMessage({ type: 'success', text: t('auth.emailVerification.success', 'Verification email sent! Please check your inbox.') })
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
      setVerificationMessage({ type: 'error', text: t('auth.emailVerification.error', 'Failed to send verification email.') })
    } finally {
      setIsResendingVerification(false)
    }
  }

  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100">
            <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.customer.personalInfo')}</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 px-3 md:px-6 py-4 md:py-6">
        {/* Email Verification Banner - BOTTOM */}
        {/* Show ONLY when: email not verified AND Telegram banner is showing at TOP (Telegram not connected AND not dismissed) */}
        {!profile.isEmailVerified && !profile.telegramId && !telegramBannerDismissed && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-900 mb-1">
                  {t('profile.verifyEmailPrompt', 'Verify your email address')}
                </h4>
                <p className="text-sm text-amber-800 mb-3">
                  {t('profile.verifyEmailMessage', 'Get important updates about your tasks and applications. A verification email was sent when you signed up.')}
                </p>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  onPress={handleResendVerification}
                  isLoading={isResendingVerification}
                  className="font-semibold"
                  startContent={!isResendingVerification && <Send className="w-4 h-4" />}
                >
                  {isResendingVerification
                    ? t('profile.sending', 'Sending...')
                    : t('profile.sendVerificationEmail', 'Send Verification Email')}
                </Button>

                {/* Verification Status Message */}
                {verificationMessage && (
                  <div className={`mt-3 p-2 rounded-lg ${
                    verificationMessage.type === 'success'
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`text-sm font-medium ${
                      verificationMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationMessage.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {errorMessage && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  {t('common.error', 'Error')}
                </p>
                <p className="text-sm text-red-800">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.email')}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate">{profile.email}</p>
                  {profile.isEmailVerified && (
                    <Chip size="sm" variant="flat" color="success" startContent={<Shield className="w-3 h-3" />} className="flex-shrink-0">
                      Verified
                    </Chip>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.phone')}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                  {profile.isPhoneVerified ? (
                    <Chip size="sm" variant="flat" color="success" startContent={<Shield className="w-3 h-3" />} className="flex-shrink-0">
                      Verified
                    </Chip>
                  ) : (
                    <Chip size="sm" variant="flat" color="warning" className="flex-shrink-0">
                      Not Verified
                    </Chip>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="p-2 rounded-lg bg-orange-100">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.location')}</p>
                <p className="font-semibold text-gray-900">
                  {profile.city
                    ? getCityLabelBySlug(profile.city, t)
                    : 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.memberSince')}</p>
                <p className="font-semibold text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.customer.language', 'Language')}</p>
                <p className="font-semibold text-gray-900">
                  {profile.preferredLanguage === 'en' && t('language.en', 'English')}
                  {profile.preferredLanguage === 'bg' && t('language.bg', 'Български')}
                  {profile.preferredLanguage === 'ru' && t('language.ru', 'Русский')}
                  {profile.preferredLanguage === 'ua' && t('language.ua', 'Українська')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className={`p-2 rounded-lg ${profile.preferredContact === 'telegram' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                {profile.preferredContact === 'telegram' ? (
                  <Send className="w-5 h-5 text-blue-600" />
                ) : (
                  <Mail className="w-5 h-5 text-pink-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.customer.preferredContact', 'Preferred Contact')}</p>
                <p className="font-semibold text-gray-900">
                  {profile.preferredContact === 'email' && t('profile.email', 'Email')}
                  {profile.preferredContact === 'telegram' && 'Telegram'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              personalForm.handleSubmit()
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <personalForm.Field name="name">
                {(field) => (
                  <Input
                    label={t('profile.form.name')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    startContent={<UserIcon className="w-4 h-4 text-gray-500" />}
                  />
                )}
              </personalForm.Field>

              {/* Email Field */}
              <personalForm.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return t('profile.form.validation.emailRequired')
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return t('profile.form.validation.emailInvalid')
                    }
                  }
                }}
              >
                {(field) => (
                  <Input
                    type="email"
                    label={t('profile.email')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    isRequired
                    isInvalid={!!field.state.meta.errors.length}
                    errorMessage={field.state.meta.errors[0]}
                    startContent={<Mail className="w-4 h-4 text-gray-500" />}
                  />
                )}
              </personalForm.Field>

              {/* Phone Field */}
              <personalForm.Field
                name="phone"
                validators={{
                  onChange: ({ value }) => {
                    // Only validate format if value is provided
                    if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
                      return t('profile.form.validation.phoneInvalid')
                    }
                  }
                }}
              >
                {(field) => (
                  <Input
                    type="tel"
                    label={t('profile.phone')}
                    value={field.state.value || ''}
                    onValueChange={(value) => field.handleChange(value || null)}
                    isInvalid={!!field.state.meta.errors.length}
                    errorMessage={field.state.meta.errors[0]}
                    startContent={<Phone className="w-4 h-4 text-gray-500" />}
                    placeholder="+359 88 123 4567"
                  />
                )}
              </personalForm.Field>

              {/* Location Field - City Autocomplete */}
              <personalForm.Field name="location">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-600">{t('profile.location')}</label>
                    <CityAutocomplete
                      value={field.state.value || undefined}
                      onChange={(city: CityOption | null) => {
                        field.handleChange(city?.slug || null)
                      }}
                      placeholder={t('profile.selectCity', 'Select your city')}
                      showProfileCity={false}
                      showLastSearched={true}
                      showPopularCities={true}
                    />
                  </div>
                )}
              </personalForm.Field>

              {/* Language Preference */}
              <personalForm.Field name="preferredLanguage">
                {(field) => (
                  <Select
                    label={t('profile.customer.preferredLanguage', 'Preferred Language')}
                    selectedKeys={[field.state.value]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string
                      if (selected === 'en' || selected === 'bg' || selected === 'ru' || selected === 'ua') {
                        field.handleChange(selected)
                      }
                    }}
                    startContent={<Globe className="w-4 h-4 text-gray-500" />}
                  >
                    <SelectItem key="en" value="en">{t('language.en', 'English')}</SelectItem>
                    <SelectItem key="bg" value="bg">{t('language.bg', 'Български')}</SelectItem>
                    <SelectItem key="ru" value="ru">{t('language.ru', 'Русский')}</SelectItem>
                    <SelectItem key="ua" value="ua">{t('language.ua', 'Українська')}</SelectItem>
                  </Select>
                )}
              </personalForm.Field>

              {/* Preferred Contact Method */}
              <personalForm.Field name="preferredContact">
                {(field) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-3">{t('profile.customer.preferredContactMethod', 'Preferred Contact Method')}</label>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) => {
                        // Validate that value is a valid PreferredContact type
                        if (value !== 'email' && value !== 'phone' && value !== 'sms' && value !== 'telegram') {
                          return // Invalid value, don't change
                        }

                        // If user tries to select Telegram without having it connected, open settings
                        if (value === 'telegram' && !hasTelegramConnected) {
                          if (onSettingsOpen) {
                            onSettingsOpen()
                          }
                          return // Don't change the value
                        }

                        // If user is switching AWAY from Telegram when it's connected, show disconnect dialog
                        if (field.state.value === 'telegram' && value !== 'telegram' && hasTelegramConnected) {
                          setPendingContactChange(value)
                          setShowTelegramDisconnectDialog(true)
                          return // Don't change the value yet
                        }

                        field.handleChange(value)
                      }}
                      orientation="horizontal"
                      classNames={{
                        wrapper: "gap-3"
                      }}
                    >
                      <Radio
                        value="email"
                        classNames={{
                          base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-between flex-row-reverse max-w-fit cursor-pointer rounded-lg gap-3 p-3 border-2 border-gray-300 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
                          wrapper: "group-data-[selected=true]:border-primary",
                          control: "bg-white border-2 group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary",
                          label: "text-sm font-medium"
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{t('profile.email', 'Email')}</span>
                        </div>
                      </Radio>
                      <Radio
                        value="telegram"
                        classNames={{
                          base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-between flex-row-reverse max-w-fit cursor-pointer rounded-lg gap-3 p-3 border-2 border-gray-300 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
                          wrapper: "group-data-[selected=true]:border-primary",
                          control: "bg-white border-2 group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary",
                          label: "text-sm font-medium"
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          <div className="flex flex-col">
                            <span>Telegram</span>
                            {!hasTelegramConnected && (
                              <span className="text-xs text-gray-500">{t('profile.telegram.clickToConnect', 'Click to connect')}</span>
                            )}
                          </div>
                        </div>
                      </Radio>
                    </RadioGroup>
                  </div>
                )}
              </personalForm.Field>
            </div>
          </form>
        )}

        <Divider />

        <div className="flex justify-end gap-2">
          {!isEditing ? (
            <Button
              size="sm"
              startContent={<Edit className="w-4 h-4 text-white" />}
              onPress={() => setIsEditing(true)}
              className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
            >
              {t('profile.editPersonalInfo')}
            </Button>
          ) : (
            <>
              <Button
                variant="bordered"
                size="sm"
                startContent={<X className="w-4 h-4" />}
                onPress={handleCancel}
                isDisabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                color="primary"
                size="sm"
                startContent={<Save className="w-4 h-4" />}
                onPress={() => personalForm.handleSubmit()}
                isLoading={isLoading}
              >
                {isLoading ? t('profile.form.saving') : t('save')}
              </Button>
            </>
          )}
        </div>
      </CardBody>

      {/* Telegram Disconnect Confirmation Dialog */}
      <Modal
        isOpen={showTelegramDisconnectDialog}
        onClose={handleCancelDisconnect}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xl">{t('profile.telegram.disconnectConfirmTitle', 'Disconnect Telegram?')}</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <p className="text-gray-700">
                {t('profile.telegram.disconnectConfirmMessage', 'Are you sure you want to stop receiving instant free Telegram notifications?')}
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  {t('profile.telegram.disconnectWarning', 'You will lose access to:')}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">•</span>
                    {t('profile.instantNotifications', 'Instant notifications (no delays)')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">•</span>
                    {t('profile.freeForever', 'Free forever (no SMS costs)')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">•</span>
                    {t('profile.richMessages', 'Rich messages with buttons and links')}
                  </li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={handleCancelDisconnect}
              isDisabled={isLoading}
            >
              {t('profile.telegram.keepTelegram', 'Keep Telegram')}
            </Button>
            <Button
              color="danger"
              onPress={handleDisconnectTelegram}
              isLoading={isLoading}
            >
              {t('profile.telegram.disconnect', 'Disconnect')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}
