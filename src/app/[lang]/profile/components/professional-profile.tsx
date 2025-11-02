'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PortfolioGalleryManager } from './portfolio-gallery-manager'
import { ProfessionalIdentitySection } from './sections/professional-identity-section'
import { ServiceCategoriesSection } from './sections/service-categories-section'
import { VerificationSection } from './sections/verification-section'
import { AvailabilitySection } from './sections/availability-section'
import { BusinessSettingsSection } from './sections/business-settings-section'
import { StatisticsSection } from './sections/statistics-section'
import { UserProfile } from '@/server/domain/user/user.types'

interface ProfessionalProfileProps {
  profile: UserProfile
  onProfileUpdate: (updates: Partial<UserProfile>) => Promise<void>
}

export function ProfessionalProfile({ profile, onProfileUpdate }: ProfessionalProfileProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  // Format years experience for display (matches dropdown options)
  const formatYearsExperience = (years: number | null): string => {
    if (!years || years <= 1) return '0-1'
    if (years <= 5) return '2-5'
    if (years <= 10) return '5-10'
    return '10+'
  }

  // Parse years experience from string to number for DB
  const parseYearsExperience = (rangeString: string): number => {
    const map: { [key: string]: number } = {
      '0-1': 1,
      '2-5': 3,
      '5-10': 7,
      '10+': 15
    }
    return map[rangeString] || 1
  }

  // Format response time for display (hours to string)
  const formatResponseTime = (hours: number | null): string => {
    if (!hours) return '24h'
    if (hours < 1) return '30m'
    if (hours <= 2) return `${Math.round(hours)}h`
    if (hours <= 24) return `${Math.round(hours)}h`
    return '24h+'
  }

  // Handlers for each section
  const handleIdentitySave = async (data: { title: string; bio: string; yearsExperience: string }) => {
    setError(null)
    try {
      await onProfileUpdate({
        professionalTitle: data.title,
        bio: data.bio,
        yearsExperience: parseYearsExperience(data.yearsExperience)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to save professional identity')
      throw err
    }
  }

  const handleCategoriesSave = async (categories: string[]) => {
    setError(null)
    try {
      await onProfileUpdate({ serviceCategories: categories })
    } catch (err: any) {
      setError(err.message || 'Failed to save service categories')
      throw err
    }
  }

  const handleVerifyPhone = () => {
    console.log('Phone verification not yet implemented')
    // TODO: Implement phone verification flow
  }

  const handleAvailabilitySave = async (data: {
    availability: string
    responseTime: string
    serviceArea: string[]
  }) => {
    setError(null)
    try {
      await onProfileUpdate({
        availabilityStatus: data.availability as 'available' | 'busy' | 'unavailable',
        responseTimeHours: parseFloat(data.responseTime) || null,
        serviceAreaCities: data.serviceArea
      })
    } catch (err: any) {
      setError(err.message || 'Failed to save availability settings')
      throw err
    }
  }

  const handleLanguageChange = async (languages: string[]) => {
    setError(null)
    try {
      await onProfileUpdate({ languages })
    } catch (err: any) {
      setError(err.message || 'Failed to update languages')
      throw err
    }
  }

  const handleBusinessSettingsSave = async (data: {
    paymentMethods: string[]
    weekdayHours: { start: string; end: string }
    weekendHours: { start: string; end: string }
  }) => {
    setError(null)
    try {
      await onProfileUpdate({
        paymentMethods: data.paymentMethods,
        weekdayHours: data.weekdayHours,
        weekendHours: data.weekendHours
      })
    } catch (err: any) {
      setError(err.message || 'Failed to save business settings')
      throw err
    }
  }

  const handlePortfolioChange = (items: any[]) => {
    console.log('Portfolio changes not yet implemented:', items)
    // TODO: Implement when portfolio feature is ready
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
          {error}
        </div>
      )}

      {/* 1. Professional Identity */}
      <ProfessionalIdentitySection
        title={profile.professionalTitle || ''}
        bio={profile.bio || ''}
        yearsExperience={formatYearsExperience(profile.yearsExperience)}
        onSave={handleIdentitySave}
      />

      {/* 2. Service Categories */}
      <ServiceCategoriesSection
        serviceCategories={profile.serviceCategories || []}
        onSave={handleCategoriesSave}
      />

      {/* 3. Verification & Trust */}
      <VerificationSection
        phoneNumber={profile.phoneNumber}
        isPhoneVerified={profile.isPhoneVerified}
        onVerifyPhone={handleVerifyPhone}
      />

      {/* 4. Availability & Preferences */}
      <AvailabilitySection
        availability={profile.availabilityStatus}
        responseTime={formatResponseTime(profile.responseTimeHours)}
        serviceArea={profile.serviceAreaCities || []}
        languages={profile.languages || []}
        onSave={handleAvailabilitySave}
        onLanguageChange={handleLanguageChange}
      />

      {/* 5. Business Settings */}
      <BusinessSettingsSection
        paymentMethods={profile.paymentMethods || []}
        weekdayHours={profile.weekdayHours || { start: '08:00', end: '18:00' }}
        weekendHours={profile.weekendHours || { start: '09:00', end: '14:00' }}
        onSave={handleBusinessSettingsSave}
      />

      {/* 6. Portfolio Gallery - Skipped for MVP */}
      {/* <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-100 flex-shrink-0">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.professional.portfolioGallery')}</h3>
              <p className="text-xs text-gray-500 hidden sm:block">{t('profile.professional.portfolioDescription')}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-4 md:px-6">
          <PortfolioGalleryManager
            items={[]}
            onChange={handlePortfolioChange}
            maxItems={6}
          />
        </CardBody>
      </Card> */}

      {/* 7. Statistics (Read-Only) */}
      <StatisticsSection
        completedTasks={profile.tasksCompleted}
        averageRating={profile.averageRating || 0}
        totalEarnings={profile.totalEarningsBgn}
        profileViews={profile.profileViews}
        memberSince={new Date(profile.createdAt).toISOString().split('T')[0]}
      />
    </div>
  )
}
