'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Search, ClipboardList, Briefcase } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ProfessionalProfile } from '../../components/professional-profile'
import { SettingsModal } from '../../components/settings-modal'
import { StatisticsModal } from '../../components/statistics-modal'
import { ProfileDataProvider } from '../../components/profile-data-provider'
import { TelegramPromptBanner } from '../../components/telegram-prompt-banner'
import { ProfileHeader } from '../../components/shared/profile-header'

interface ProfessionalProfilePageContentProps {
  lang: string
}

export function ProfessionalProfilePageContent({ lang }: ProfessionalProfilePageContentProps) {
  const { t } = useTranslation()
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false)
  const [isTelegramBannerDismissed, setIsTelegramBannerDismissed] = useState(() => {
    // Check if user previously dismissed the banner
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegram-banner-dismissed') === 'true'
    }
    return false
  })

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

  // Redirect if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const handleAvatarChange = async (newAvatar: string) => {
    // TODO: Upload avatar and update profile
    console.log('Avatar update not yet implemented:', newAvatar)
  }

  const handleTelegramConnect = () => {
    // Open settings modal (Telegram section is at the top)
    setIsSettingsOpen(true)
  }

  const handleTelegramBannerDismiss = () => {
    setIsTelegramBannerDismissed(true)
    localStorage.setItem('telegram-banner-dismissed', 'true')
  }

  const handleTelegramConnectionChange = async () => {
    // Refresh profile data after Telegram connection/disconnection
    if (refreshProfile) {
      await refreshProfile()
    } else {
      // Fallback: use Next.js router refresh (soft navigation, no full page reload)
      router.refresh()
    }
  }

  // Show banner if: not connected AND not dismissed
  const shouldShowTelegramBanner = !profile.telegramId && !isTelegramBannerDismissed

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

        {/* Telegram Connection Prompt Banner */}
        {shouldShowTelegramBanner && (
          <div className="mb-6">
            <TelegramPromptBanner
              onConnect={handleTelegramConnect}
              onDismiss={handleTelegramBannerDismiss}
            />
          </div>
        )}

        {/* Professional Quick Actions */}
        <div className="mb-4 flex flex-col md:flex-row items-center md:items-start gap-2">
          <Button
            size="sm"
            variant="bordered"
            onPress={() => router.push(`/${lang}/browse-tasks`)}
            startContent={<Search className="w-4 h-4" />}
            className="min-w-[60%] md:min-w-0 md:flex-1 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium"
          >
            {t('nav.browseTasks')}
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onPress={() => router.push(`/${lang}/tasks/applications`)}
            startContent={<ClipboardList className="w-4 h-4" />}
            className="min-w-[60%] md:min-w-0 md:flex-1 border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-medium"
          >
            {t('nav.myApplications')}
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onPress={() => router.push(`/${lang}/tasks/work`)}
            startContent={<Briefcase className="w-4 h-4" />}
            className="min-w-[60%] md:min-w-0 md:flex-1 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-medium"
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
          onTelegramConnectionChange={handleTelegramConnectionChange}
        />

        {/* Statistics Modal */}
        <StatisticsModal
          isOpen={isStatisticsOpen}
          onClose={() => setIsStatisticsOpen(false)}
          userRole="professional"
        />
      </div>
    </div>
  )
}
