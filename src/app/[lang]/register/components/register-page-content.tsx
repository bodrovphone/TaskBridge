'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardBody, Input, Button, Divider } from '@heroui/react'
import { Shield, Heart, Zap, Eye, EyeOff, PartyPopper, Briefcase, Home, Search, User, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { LocaleLink } from '@/components/common/locale-link'
import { IntentSelector } from './intent-selector'
import { SocialAuthButtons } from './social-auth-buttons'

interface RegisterPageContentProps {
  lang: string
  initialIntent?: 'professional' | 'customer'
  source?: string
}

export function RegisterPageContent({ lang, initialIntent, source }: RegisterPageContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const { signInWithGoogle, signInWithFacebook, refreshProfile, user, profile, loading: authLoading } = useAuth()

  // Track if user just registered on THIS page (to trigger redirect)
  const justRegisteredRef = useRef(false)

  // Wizard step state
  const [step, setStep] = useState<1 | 2>(initialIntent ? 2 : 1)

  // Form state
  const [intent, setIntent] = useState<'professional' | 'customer'>(initialIntent || 'professional')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameRequired, setNameRequired] = useState(false)

  // Store source for analytics if provided
  useEffect(() => {
    if (source && typeof window !== 'undefined') {
      sessionStorage.setItem('trudify_campaign_source', source)
    }
  }, [source])

  // Only redirect if user just registered on this page
  useEffect(() => {
    if (user && justRegisteredRef.current) {
      handlePostAuthRedirect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Set intent cookie for OAuth flow
  const setIntentCookie = () => {
    if (typeof window !== 'undefined') {
      document.cookie = `trudify_registration_intent=${intent}; path=/; max-age=3600; SameSite=Lax`
      // Also set in localStorage for the callback
      localStorage.setItem('trudify_registration_intent', intent)
    }
  }

  // Handle post-auth redirect based on intent
  const handlePostAuthRedirect = () => {
    if (intent === 'professional') {
      router.push(`/${lang}/profile/professional`)
    } else {
      router.push(`/${lang}`)
    }
  }

  // Handle OAuth
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError(null)
    setIntentCookie()

    try {
      const result = await signInWithGoogle()
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // Redirect happens automatically via OAuth
    } catch {
      setError(t('auth.popupBlocked'))
      setIsLoading(false)
    }
  }

  const handleFacebookAuth = async () => {
    setIsLoading(true)
    setError(null)
    setIntentCookie()

    try {
      const result = await signInWithFacebook()
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // Redirect happens automatically via OAuth
    } catch {
      setError(t('auth.popupBlocked'))
      setIsLoading(false)
    }
  }

  // Handle email/password submit
  const handleSubmit = async () => {
    if (!email || !password) return

    setIsLoading(true)
    setError(null)
    setNameRequired(false)

    try {
      const response = await fetch('/api/auth/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName.trim(),
          locale: lang,
          registrationIntent: intent,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.name_required) {
          setNameRequired(true)
          setError(t('auth.nameRequired'))
        } else {
          setError(result.error || t('auth.unexpectedError'))
        }
        setIsLoading(false)
        return
      }

      // Success - mark as just registered and refresh profile (redirect will happen via useEffect)
      justRegisteredRef.current = true
      await refreshProfile()
      handlePostAuthRedirect()
    } catch {
      setError(t('auth.unexpectedError'))
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
      </div>
    )
  }

  // Already logged in - show friendly banner instead of form
  if (user && !justRegisteredRef.current) {
    return (
      <div className="min-h-screen relative">
        {/* Background image with overlay - same as main form */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/cleaner-optimized.webp)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/85 to-indigo-100/90" />
        </div>

        <div className="relative overflow-hidden py-12 lg:py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-xl border border-slate-200 overflow-hidden">
                <CardBody className="p-8 lg:p-12 text-center">
                  {/* Fun animation */}
                  <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <PartyPopper className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>

                  {/* Greeting */}
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
                    {t('auth.register.alreadyLoggedInTitle')}
                  </h1>
                  <p className="text-lg text-slate-600 mb-2">
                    {t('auth.register.alreadyLoggedInHello')}{' '}
                    <span className="font-semibold text-slate-800">
                      {profile?.fullName || user.email}
                    </span>!
                  </p>
                  <p className="text-slate-500 mb-8">
                    {t('auth.register.alreadyLoggedInMessage')}
                  </p>

                  {/* Navigation buttons */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      as={LocaleLink}
                      href="/browse-tasks"
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-md"
                      startContent={<Search className="w-5 h-5" />}
                    >
                      {t('auth.register.browseTasks')}
                    </Button>
                    <Button
                      as={LocaleLink}
                      href="/create-task"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md"
                      startContent={<Home className="w-5 h-5" />}
                    >
                      {t('auth.register.createTask')}
                    </Button>
                    <Button
                      as={LocaleLink}
                      href="/profile/professional"
                      size="lg"
                      variant="bordered"
                      className="w-full font-semibold border-slate-300"
                      startContent={<Briefcase className="w-5 h-5" />}
                    >
                      {t('auth.register.setupProfessional')}
                    </Button>
                    <Button
                      as={LocaleLink}
                      href="/professionals"
                      size="lg"
                      variant="bordered"
                      className="w-full font-semibold border-slate-300"
                      startContent={<User className="w-5 h-5" />}
                    >
                      {t('auth.register.browseProfessionals')}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background image with overlay - fixed to prevent scaling on step change */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/cleaner-optimized.webp)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/85 to-indigo-100/90" />
      </div>

      <div className="relative overflow-hidden py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 lg:mb-10"
          >
            <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">
              {t('auth.register.pageTitle')}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              {t('auth.register.pageSubtitle')}
            </p>

            {/* 100% Free badge */}
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-full text-emerald-700 text-sm font-semibold shadow-sm">
                <Heart className="w-4 h-4 text-emerald-500" />
                {t('auth.register.freeForever')}
              </span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                1
              </div>
              <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: '0%' }}
                  animate={{ width: step === 2 ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                2
              </div>
            </div>
          </motion.div>

          {/* Wizard Content */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* Step 1: Intent Selection */
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto"
              >
                <Card className="shadow-xl border border-slate-200">
                  <CardBody className="p-6 lg:p-8">
                    <p className="text-center text-slate-700 font-medium mb-6">
                      {t('auth.register.selectIntent')}
                    </p>
                    <IntentSelector
                      value={intent}
                      onChange={setIntent}
                      disabled={false}
                    />

                    {/* Continue button */}
                    <div className="mt-8">
                      <Button
                        size="lg"
                        className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        onPress={() => setStep(2)}
                        endContent={<ArrowRight className="w-5 h-5" />}
                      >
                        {t('auth.register.continueToSignup')}
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {/* Trust Indicators */}
                <div className="mt-8">
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium">{t('auth.register.benefitVerified')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <span className="text-sm font-medium">{t('auth.register.benefitFree')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium">{t('auth.register.benefitFast')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Step 2: Auth Form */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto"
              >
                {/* Back button */}
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('auth.register.backToIntent')}</span>
                </button>

                {/* Selected intent badge */}
                <div className="flex justify-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    intent === 'professional'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {intent === 'professional' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <Home className="w-4 h-4" />
                    )}
                    {intent === 'professional'
                      ? t('auth.register.intentProfessional')
                      : t('auth.register.intentCustomer')}
                  </div>
                </div>

                <Card className="shadow-xl border border-slate-200">
                  <CardBody className="p-6 lg:p-8">
                    <div className="space-y-6">
                      {/* Social Auth Buttons - prominently displayed */}
                      <div className="pt-2 pb-8">
                        <p className="text-center text-sm font-medium text-slate-700 mb-4">
                          {t('auth.register.oneClickSignup')}
                        </p>
                        <SocialAuthButtons
                          onGoogleClick={handleGoogleAuth}
                          onFacebookClick={handleFacebookAuth}
                          isLoading={isLoading}
                        />
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <Divider />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-slate-500">
                          {t('auth.or')}
                        </span>
                      </div>

                      {/* Arrow hint to use social auth */}
                      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <ArrowUp className="w-4 h-4" />
                        <span>{t('auth.register.useQuickSignup')}</span>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                          {error}
                        </div>
                      )}

                      {/* Unified Form - works for both login and registration */}
                      <div className="space-y-4">
                        <Input
                          type="email"
                          label={t('auth.emailLabel')}
                          placeholder="your@email.com"
                          value={email}
                          onValueChange={setEmail}
                          isDisabled={isLoading}
                          variant="bordered"
                          classNames={{
                            inputWrapper: 'border-slate-300',
                          }}
                        />

                        <Input
                          type={showPassword ? 'text' : 'password'}
                          label={t('auth.password')}
                          placeholder="••••••••"
                          value={password}
                          onValueChange={setPassword}
                          isDisabled={isLoading}
                          variant="bordered"
                          classNames={{
                            inputWrapper: 'border-slate-300',
                          }}
                          endContent={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                              ) : (
                                <Eye className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          }
                        />

                        {/* Name field - always visible but muted (unified auth UX)
                            Shows as required (red) when API returns name_required */}
                        <div className={`transition-all duration-200 ${nameRequired ? '' : 'opacity-60'}`}>
                          <Input
                            type="text"
                            label={t('auth.fullName')}
                            placeholder="Ivan Petrov"
                            value={fullName}
                            onValueChange={(val) => {
                              setFullName(val)
                              if (nameRequired) setNameRequired(false)
                            }}
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                              inputWrapper: nameRequired
                                ? 'border-red-500 bg-red-50'
                                : 'border-slate-300 bg-slate-50/50',
                            }}
                            description={
                              nameRequired
                                ? t('auth.nameRequiredHint')
                                : t('auth.nameHint')
                            }
                          />
                        </div>

                        {/* Submit Button */}
                        <Button
                          color="primary"
                          size="lg"
                          className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                          onPress={handleSubmit}
                          isLoading={isLoading}
                          isDisabled={!email || !password}
                        >
                          {t('auth.continue')}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
