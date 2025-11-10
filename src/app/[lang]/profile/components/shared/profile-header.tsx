'use client'

import { Card, CardBody, Button, Chip } from '@nextui-org/react'
import { Shield, BarChart3, Settings, Bell, AlertCircle, Mail, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AvatarUpload } from '../avatar-upload'
import type { UserProfile } from '@/server/domain/user/user.types'

interface ProfileHeaderProps {
  profile: UserProfile
  onAvatarChange: (newAvatar: string) => Promise<void>
  onSettingsOpen: () => void
  onStatisticsOpen: () => void
  profileType?: 'customer' | 'professional' // Determines completion calculation logic
}

export function ProfileHeader({
  profile,
  onAvatarChange,
  onSettingsOpen,
  onStatisticsOpen,
  profileType = 'customer'
}: ProfileHeaderProps) {
  const { t } = useTranslation()

  // Calculate profile completion based on profile type
  const calculateCompletion = () => {
    if (profileType === 'professional') {
      // Professional profile completion logic
      // CRITICAL: Show 0% until professional title is filled (minimum requirement)
      if (!profile.professionalTitle) {
        return 0
      }

      let completed = 0
      let total = 10

      // Essential fields
      if (profile.professionalTitle) completed += 3 // Worth 30% - minimum required
      if (profile.fullName) completed++
      if (profile.phoneNumber) completed++

      // Recommended fields
      if (profile.serviceCategories?.length > 0) completed += 2 // Worth 20%
      if (profile.city) completed++ // Locations
      if (profile.bio) completed++ // Bio

      // Additional helpful fields
      if (profile.avatarUrl) completed++
      if (profile.isPhoneVerified) completed++

      return Math.round((completed / total) * 100)
    } else {
      // Customer profile completion logic
      let completed = 0
      let total = 10

      if (profile.fullName) completed++
      if (profile.phoneNumber) completed++
      if (profile.city) completed++
      if (profile.bio) completed++
      if (profile.avatarUrl) completed++
      if (profile.isEmailVerified) completed++
      if (profile.isPhoneVerified) completed++
      if (profile.preferredLanguage) completed++
      if (profile.preferredContact) completed++
      if (profile.serviceCategories?.length > 0) completed++

      return Math.round((completed / total) * 100)
    }
  }

  const completionPercentage = calculateCompletion()

  // Check if professional profile is incomplete
  const isProfessionalIncomplete = profileType === 'professional' && !profile.professionalTitle

  return (
    <div className="mb-8">
      <Card className="shadow-2xl border border-white/20 bg-white/95 hover:shadow-blue-500/10 transition-shadow duration-300">
        <CardBody className="p-4 md:p-8 relative overflow-hidden">
          {/* Enhanced gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-white/10 to-secondary-50/40 pointer-events-none"></div>

          {/* Decorative corner accent */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-200 to-blue-300 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10">
            {/* Profile Type Title */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {profileType === 'professional'
                  ? t('profile.professionalProfileTitle', 'Professional Profile Information')
                  : t('profile.customerProfileTitle', 'Customer Profile Information')
                }
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <AvatarUpload
                currentAvatar={profile.avatarUrl}
                userName={profile.fullName || profile.email}
                onAvatarChange={onAvatarChange}
                size="lg"
              />

              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                    {profile.fullName || profile.email}
                  </h1>
                  {(profile.isEmailVerified && profile.isPhoneVerified) && (
                    <Chip
                      color="success"
                      variant="flat"
                      startContent={<Shield className="w-4 h-4" />}
                      size="sm"
                      className="shadow-sm"
                    >
                      {t('profile.verified')}
                    </Chip>
                  )}
                </div>

                {/* Current notification preference */}
                <p className="text-gray-600 mb-4 flex items-center gap-2">
                  {profile.preferredContact === 'telegram' ? (
                    <>
                      <Send className="w-4 h-4 text-blue-500" />
                      <span>
                        Telegram
                        {profile.telegramFirstName && (
                          <span className="text-gray-500"> ({profile.telegramFirstName})</span>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-gray-400" />
                      {profile.email}
                    </>
                  )}
                </p>

                {/* Profile completion with visual indicator */}
                <div className="w-full mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('profile.completion')}</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Professional Profile Incomplete Warning */}
                {isProfessionalIncomplete && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          {t('profile.professional.incompleteTitle', 'Complete Your Professional Profile')}
                        </p>
                        <p className="text-sm text-amber-800">
                          <span className="font-medium">{t('profile.professional.minimumRequired', 'Minimum required')}:</span>{' '}
                          {t('profile.professional.titleField', 'Professional Title')}
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          <span className="font-medium">{t('profile.professional.recommended', 'Recommended')}:</span>{' '}
                          {t('profile.professional.recommendedFields', 'Categories (Services), Location, and Bio')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    startContent={<BarChart3 className="w-4 h-4 text-white" />}
                    onPress={onStatisticsOpen}
                    className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
                  >
                    {t('profile.statistics')}
                  </Button>

                  <Button
                    size="sm"
                    variant="bordered"
                    startContent={<Settings className="w-4 h-4" />}
                    onPress={onSettingsOpen}
                    className="hover:scale-105 transition-transform border-gray-300 hover:border-primary hover:bg-primary/5"
                  >
                    {t('profile.settings')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
