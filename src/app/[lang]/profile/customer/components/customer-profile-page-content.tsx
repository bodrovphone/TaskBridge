'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, Button } from '@nextui-org/react'
import { FileText, Send } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { CustomerProfile } from '../../components/customer-profile'
import { SettingsModal } from '../../components/settings-modal'
import { StatisticsModal } from '../../components/statistics-modal'
import { ProfileDataProvider } from '../../components/profile-data-provider'
import { NotificationBannerManager } from '../../components/notification-banner-manager'
import { ProfileHeader } from '../../components/shared/profile-header'
import { useCreateTask } from '@/hooks/use-create-task'
import { ReviewEnforcementDialog } from '@/features/reviews'

interface CustomerProfilePageContentProps {
  lang: string
}

export function CustomerProfilePageContent({ lang }: CustomerProfilePageContentProps) {
  const { t } = useTranslation()
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false)

  const {
    handleCreateTask,
    showEnforcementDialog,
    setShowEnforcementDialog,
    blockType,
    blockingTasks,
    handleReviewTask
  } = useCreateTask()

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
    console.log('[CustomerProfile] Avatar changed:', newAvatarUrl)

    // The avatar upload component already uploaded to storage and updated the database
    // We just need to refresh the profile data to ensure consistency
    try {
      await refreshProfile()
      console.log('[CustomerProfile] Profile refreshed after avatar change')
    } catch (error) {
      console.error('[CustomerProfile] Failed to refresh profile:', error)
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
          profileType="customer"
        />

        {/* Smart Notification Banner System */}
        <NotificationBannerManager
          emailVerified={profile.isEmailVerified || false}
          telegramConnected={!!profile.telegramId}
          onTelegramConnect={handleTelegramConnect}
        />

        {/* Customer Quick Actions */}
        <div className="mb-4 flex gap-3">
          <Button
            size="lg"
            variant="flat"
            onPress={() => router.push(`/${lang}/tasks/posted`)}
            startContent={<FileText className="w-5 h-5" />}
            className="flex-1 bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200"
          >
            {t('nav.myPostedTasks')}
          </Button>
          <Button
            size="lg"
            variant="flat"
            onPress={handleCreateTask}
            startContent={<Send className="w-5 h-5" />}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            {t('profile.quickActions.createTask')}
          </Button>
        </div>

        {/* Customer Profile Content */}
        <Card className="shadow-xl border border-white/20 bg-white/95 hover:shadow-2xl transition-shadow duration-300">
          <CardBody className="p-3 md:p-8">
            <ProfileDataProvider>
              {({ profile: currentProfile, updateProfile }) => (
                currentProfile && (
                  <CustomerProfile
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
          userRole="customer"
          profile={profile}
        />

        {/* Review Enforcement Dialog */}
        <ReviewEnforcementDialog
          isOpen={showEnforcementDialog}
          onClose={() => setShowEnforcementDialog(false)}
          blockType={blockType}
          pendingTasks={blockingTasks}
          onReviewTask={handleReviewTask}
        />
      </div>
    </div>
  )
}
