'use client'

import { Card, CardBody, Chip } from '@nextui-org/react'
import { Shield, AlertCircle, Mail, Send, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AvatarUpload } from '../avatar-upload'
import type { UserProfile } from '@/server/domain/user/user.types'
import { useProfessionalListingStatus } from '@/hooks/use-professional-listing-status'
import { BadgeDisplay } from '@/features/professionals/components/badges'

interface ProfileHeaderProps {
  profile: UserProfile
  onAvatarChange: (newAvatar: string) => Promise<void>
  profileType?: 'customer' | 'professional' // Determines completion calculation logic
}

export function ProfileHeader({
  profile,
  onAvatarChange,
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

  // Professional listing status (uses shared hook)
  const {
    requirements: professionalRequirements,
    isListed,
    isComplete: allProfessionalRequirementsMet,
    firstIncompleteSectionId,
  } = useProfessionalListingStatus(profileType === 'professional' ? profile : null)

  // Scroll to first incomplete section with smooth animation
  const scrollToIncompleteSection = () => {
    if (firstIncompleteSectionId) {
      const element = document.getElementById(firstIncompleteSectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add a brief highlight animation
        element.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2')
        }, 2000)
      }
    }
  }

  // Check if professional profile is incomplete (not listed)
  const isProfessionalIncomplete = profileType === 'professional' && !isListed

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
                <div className="flex items-center gap-3 mb-2 flex-wrap">
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

                {/* Achievement Badges */}
                {(profile.isTopProfessional || profile.isEarlyAdopter) && (
                  <div className="mb-3">
                    <BadgeDisplay
                      isTopProfessional={profile.isTopProfessional}
                      topProfessionalTasksCount={profile.topProfessionalTasksCount}
                      isEarlyAdopter={profile.isEarlyAdopter}
                      earlyAdopterCategories={profile.earlyAdopterCategories}
                      size="md"
                    />
                  </div>
                )}

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

                {/* Professional Listing Requirements Checklist - Clickable Banner */}
                {profileType === 'professional' && !allProfessionalRequirementsMet && (
                  <button
                    onClick={scrollToIncompleteSection}
                    className={`w-full text-left mb-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer group ${
                      isProfessionalIncomplete
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400 hover:from-amber-100 hover:to-orange-100'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${isProfessionalIncomplete ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <AlertCircle className={`w-5 h-5 ${isProfessionalIncomplete ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold mb-1 ${isProfessionalIncomplete ? 'text-amber-900' : 'text-blue-900'}`}>
                            {isProfessionalIncomplete
                              ? t('profile.listing.notListed', 'Your profile is not listed yet')
                              : t('profile.listing.incomplete', 'Complete your profile')
                            }
                          </h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                            isProfessionalIncomplete
                              ? 'bg-amber-200 text-amber-800 group-hover:bg-amber-300'
                              : 'bg-blue-200 text-blue-800 group-hover:bg-blue-300'
                          }`}>
                            {t('profile.listing.clickToFix', 'Click to fix')} →
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${isProfessionalIncomplete ? 'text-amber-800' : 'text-blue-800'}`}>
                          {isProfessionalIncomplete
                            ? t('profile.listing.notListedMessage', 'Add a professional title to appear in our search and receive job opportunities from customers.')
                            : t('profile.listing.incompleteMessage', 'Fill in the missing information to improve your visibility and attract more customers.')
                          }
                        </p>

                        {/* Requirements checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {professionalRequirements.map((req) => (
                            <div
                              key={req.key}
                              className={`flex items-center gap-2 text-sm ${
                                req.met ? 'text-green-700' : isProfessionalIncomplete ? 'text-amber-700' : 'text-blue-700'
                              }`}
                            >
                              {req.met ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                                  isProfessionalIncomplete ? 'border-amber-400' : 'border-blue-400'
                                }`} />
                              )}
                              <span className={req.met ? 'line-through opacity-60' : 'font-medium'}>
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
