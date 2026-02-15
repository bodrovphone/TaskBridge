'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, Button } from '@heroui/react'
import { Search, ClipboardList, Briefcase, ArrowRightLeft } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { loadPendingProfessional, clearPendingProfessional } from '@/app/[lang]/register/lib/professional-draft'
import { ProfessionalProfile } from '../../components/professional-profile'
import { ProfileDataProvider } from '../../components/profile-data-provider'
import { NotificationBannerManager } from '../../components/notification-banner-manager'
import { AchievementBanner } from '../../components/achievement-banner'
import { ProfileHeader } from '../../components/shared/profile-header'
// HIDDEN: Business Overview section - not in MVP, may bring back later
// import { StatisticsSection } from '../../components/sections/statistics-section'
import { AccountSettingsSection } from '../../components/sections/account-settings-section'

interface ProfessionalProfilePageContentProps {
  lang: string
}

export function ProfessionalProfilePageContent({ lang }: ProfessionalProfilePageContentProps) {
  const t = useTranslations()
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const pendingProfileAppliedRef = useRef(false)

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${lang}`)
    }
  }, [user, loading, router, lang])

  // Apply pending professional data from registration flow
  // (saved to localStorage before OAuth redirect or email/password auth)
  useEffect(() => {
    if (!user || pendingProfileAppliedRef.current) return

    const draft = loadPendingProfessional()
    if (!draft) return

    pendingProfileAppliedRef.current = true

    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        professionalTitle: draft.professionalTitle,
        serviceCategories: draft.serviceCategories,
        city: draft.city,
      }),
    })
      .then((res) => {
        if (res.ok) {
          clearPendingProfessional()
          refreshProfile()
          console.log('[ProfessionalProfile] Applied pending registration data')
        } else {
          console.error('[ProfessionalProfile] Failed to apply pending data:', res.status)
        }
      })
      .catch((err) => {
        console.error('[ProfessionalProfile] Error applying pending data:', err)
      })
  }, [user, refreshProfile])

  // Check for openSettings query parameter from toast - scroll to settings section
  useEffect(() => {
    const openSettings = searchParams.get('openSettings')
    if (openSettings === 'telegram') {
      // Clean up URL without reloading
      const url = new URL(window.location.href)
      url.searchParams.delete('openSettings')
      window.history.replaceState({}, '', url.toString())
      // Scroll to settings section
      setTimeout(() => {
        document.getElementById('account-settings')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [searchParams])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!user || !profile) {
    return null
  }

  const handleAvatarChange = async (newAvatarUrl: string) => {
    console.log('[ProfessionalProfile] Avatar changed:', newAvatarUrl)

    // The avatar upload component already uploaded to storage and updated the database
    // We just need to refresh the profile data to ensure consistency
    try {
      await refreshProfile()
      console.log('[ProfessionalProfile] Profile refreshed after avatar change')
    } catch (error) {
      console.error('[ProfessionalProfile] Failed to refresh profile:', error)
    }
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.webp)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-blue-50/50"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-56 h-56 bg-secondary-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          onAvatarChange={handleAvatarChange}
          profileType="professional"
        />

        {/* Switch to Customer Profile */}
        <div className="mb-4 flex justify-end">
          <Button
            size="md"
            variant="flat"
            onPress={() => router.push(`/${lang}/profile/customer`)}
            startContent={<ArrowRightLeft className="w-4 h-4" />}
            className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 font-semibold border border-blue-200 shadow-sm"
          >
            {t('profile.switchToCustomer')}
          </Button>
        </div>

        {/* Smart Notification Banner System */}
        <NotificationBannerManager
          emailVerified={profile.isEmailVerified || false}
          telegramConnected={!!profile.telegramId}
        />

        {/* Achievement Banner for professionals with badges */}
        <AchievementBanner
          isTopProfessional={profile.isTopProfessional || false}
          topProfessionalTasksCount={profile.topProfessionalTasksCount || 0}
          isEarlyAdopter={profile.isEarlyAdopter || false}
        />

        {/* Professional Quick Actions */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            size="lg"
            variant="flat"
            onPress={() => router.push(`/${lang}/browse-tasks`)}
            startContent={<Search className="w-5 h-5" />}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            {t('nav.browseTasks')}
          </Button>
          <Button
            size="lg"
            variant="flat"
            onPress={() => router.push(`/${lang}/tasks/applications`)}
            startContent={<ClipboardList className="w-5 h-5" />}
            className="bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200"
          >
            {t('nav.myApplications')}
          </Button>
          <Button
            size="lg"
            variant="flat"
            onPress={() => router.push(`/${lang}/tasks/work`)}
            startContent={<Briefcase className="w-5 h-5" />}
            className="bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200"
          >
            {t('nav.myWork')}
          </Button>
        </div>

        {/* Professional Profile Content */}
        <Card className="shadow-xl border border-white/20 bg-white/95 hover:shadow-2xl transition-shadow duration-300 mb-4">
          <CardBody className="p-3 md:p-8">
            <ProfileDataProvider>
              {({ profile: currentProfile, updateProfile }) => (
                currentProfile && (
                  <ProfessionalProfile
                    profile={currentProfile}
                    onProfileUpdate={updateProfile}
                  />
                )
              )}
            </ProfileDataProvider>
          </CardBody>
        </Card>

        {/* HIDDEN: Business Overview section - not in MVP, may bring back later */}
        {/* <div className="mb-4">
          <StatisticsSection
            userRole="professional"
            profile={profile}
          />
        </div> */}

        {/* Account Settings Section (inline) */}
        <div id="account-settings" className="mb-4">
          <AccountSettingsSection
            lang={lang}
            userId={profile.id}
            telegramConnected={!!profile.telegramId}
            telegramUsername={profile.telegramUsername}
            telegramFirstName={profile.telegramFirstName}
            onTelegramConnectionChange={refreshProfile}
          />
        </div>
      </div>
    </div>
  )
}
