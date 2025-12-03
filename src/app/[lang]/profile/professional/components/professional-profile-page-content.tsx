'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Search, ClipboardList, Briefcase, ArrowRightLeft } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { ProfessionalProfile } from '../../components/professional-profile'
import { SettingsModal } from '../../components/settings-modal'
import { StatisticsModal } from '../../components/statistics-modal'
import { ProfileDataProvider } from '../../components/profile-data-provider'
import { NotificationBannerManager } from '../../components/notification-banner-manager'
import { ProfileHeader } from '../../components/shared/profile-header'

interface ProfessionalProfilePageContentProps {
  lang: string
}

export function ProfessionalProfilePageContent({ lang }: ProfessionalProfilePageContentProps) {
  const { t } = useTranslation()
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false)

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${lang}`)
    }
  }, [user, loading, router, lang])

  // Check for openSettings query parameter from toast
  useEffect(() => {
    const openSettings = searchParams.get('openSettings')
    if (openSettings === 'telegram') {
      setIsSettingsOpen(true)
      // Clean up URL without reloading
      const url = new URL(window.location.href)
      url.searchParams.delete('openSettings')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading', 'Loading...')}</p>
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

  const handleTelegramConnect = () => {
    // Open settings modal (Telegram section is at the top)
    setIsSettingsOpen(true)
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.png)',
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
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onStatisticsOpen={() => setIsStatisticsOpen(true)}
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
            {t('profile.switchToCustomer', 'Switch to Customer Profile')}
          </Button>
        </div>

        {/* Smart Notification Banner System */}
        <NotificationBannerManager
          emailVerified={profile.isEmailVerified || false}
          telegramConnected={!!profile.telegramId}
          onTelegramConnect={handleTelegramConnect}
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
        <Card className="shadow-xl border border-white/20 bg-white/95 hover:shadow-2xl transition-shadow duration-300">
          <CardBody className="p-3 md:p-8">
            <ProfileDataProvider>
              {({ profile: currentProfile, updateProfile }) => (
                currentProfile && (
                  <ProfessionalProfile
                    profile={currentProfile}
                    onProfileUpdate={updateProfile}
                    onSettingsOpen={() => setIsSettingsOpen(true)}
                  />
                )
              )}
            </ProfileDataProvider>
          </CardBody>
        </Card>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userId={profile.id}
          telegramConnected={!!profile.telegramId}
          telegramUsername={profile.telegramUsername}
          telegramFirstName={profile.telegramFirstName}
        />

        {/* Statistics Modal */}
        <StatisticsModal
          isOpen={isStatisticsOpen}
          onClose={() => setIsStatisticsOpen(false)}
          userRole="professional"
          profile={profile}
        />
      </div>
    </div>
  )
}
