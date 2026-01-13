'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardBody } from '@heroui/react'
import { Camera } from 'lucide-react'
import { ProfessionalIdentitySection } from './sections/professional-identity-section'
import { ServiceCategoriesSection } from './sections/service-categories-section'
// HIDDEN: Not in MVP
// import { AvailabilitySection } from './sections/availability-section'
// import { BusinessSettingsSection } from './sections/business-settings-section'
import { ServicesPricingSection } from './sections/services-pricing-section'
import { PersonalInfoSection } from './shared/personal-info-section'
import { PortfolioGalleryManager } from './portfolio-gallery-manager'
import { UserProfile, PreferredContact, PreferredLanguage, GalleryItem, ServiceItem } from '@/server/domain/user/user.types'
import { useProfessionalListingStatus } from '@/hooks/use-professional-listing-status'
import { searchKeywords } from '@/features/categories/lib/category-keywords'

interface ProfessionalProfileProps {
  profile: UserProfile
  onProfileUpdate: (updates: Partial<UserProfile>) => Promise<void>
}

export function ProfessionalProfile({ profile, onProfileUpdate }: ProfessionalProfileProps) {
  const t = useTranslations()
  const params = useParams()
  const [error, setError] = useState<string | null>(null)
  const [categoriesAutoApplied, setCategoriesAutoApplied] = useState(false)

  // Get current locale for keyword search
  const currentLocale = (params?.lang as 'en' | 'bg' | 'ru') || 'bg'

  // Get incomplete section IDs for highlighting
  const { incompleteSectionIds, isComplete } = useProfessionalListingStatus(profile)

  // Auto-suggest categories based on professional title
  // Only shows medium-confidence matches (70-89) since high-confidence (90+) are auto-applied
  const suggestedCategories = useMemo(() => {
    // Only suggest if user has a title but no categories yet
    if (!profile.professionalTitle || profile.professionalTitle.length < 3) {
      return []
    }
    if (profile.serviceCategories && profile.serviceCategories.length > 0) {
      return [] // User already has categories, don't suggest
    }

    // Search for matching categories based on title
    const results = searchKeywords(profile.professionalTitle, currentLocale)

    // Return top 3 medium-confidence suggestions (70-89)
    // High-confidence matches (90+) are auto-applied in handleIdentitySave
    return results
      .filter(r => r.score >= 70 && r.score < 90)
      .slice(0, 3)
      .map(r => r.slug)
  }, [profile.professionalTitle, profile.serviceCategories, currentLocale])

  // Handler for personal information
  const handlePersonalInfoSave = async (data: {
    name: string
    phone: string
    location: string
    preferredLanguage: PreferredLanguage
    preferredContact: PreferredContact
  }) => {
    setError(null)
    try {
      await onProfileUpdate({
        fullName: data.name,
        phoneNumber: data.phone,
        city: data.location,
        preferredLanguage: data.preferredLanguage,
        preferredContact: data.preferredContact,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to save personal information')
      throw err
    }
  }

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

  // HIDDEN: Not in MVP - format response time for display
  // const formatResponseTime = (hours: number | null): string => {
  //   if (!hours) return '24h'
  //   if (hours < 1) return '30m'
  //   if (hours <= 2) return `${Math.round(hours)}h`
  //   if (hours <= 24) return `${Math.round(hours)}h`
  //   return '24h+'
  // }

  // Handlers for each section
  const handleIdentitySave = async (data: { title: string; bio: string; yearsExperience: string }) => {
    setError(null)
    try {
      await onProfileUpdate({
        professionalTitle: data.title,
        bio: data.bio,
        yearsExperience: parseYearsExperience(data.yearsExperience)
      })

      // Hybrid auto-category matching:
      // If user has no categories and title changed, auto-apply high-confidence matches (score >= 90)
      if ((!profile.serviceCategories || profile.serviceCategories.length === 0) && data.title.length >= 3) {
        const results = searchKeywords(data.title, currentLocale)
        const highConfidenceMatches = results
          .filter(r => r.score >= 90)
          .slice(0, 3)
          .map(r => r.slug)

        if (highConfidenceMatches.length > 0) {
          // Auto-apply high-confidence categories
          await onProfileUpdate({ serviceCategories: highConfidenceMatches })

          // Flag to show confirmation banner in categories section
          setCategoriesAutoApplied(true)
        }
      }
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

  // HIDDEN: Not in MVP - availability and business settings handlers
  // const handleAvailabilitySave = async (data: { responseTime: string }) => {
  //   setError(null)
  //   try {
  //     await onProfileUpdate({ responseTimeHours: parseFloat(data.responseTime) || null })
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to save availability settings')
  //     throw err
  //   }
  // }
  // const handleLanguageChange = async (languages: string[]) => {
  //   setError(null)
  //   try {
  //     await onProfileUpdate({ languages })
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to update languages')
  //     throw err
  //   }
  // }
  // const handleBusinessSettingsSave = async (data: {
  //   paymentMethods: string[]
  //   weekdayHours: { start: string; end: string }
  //   weekendHours: { start: string; end: string }
  // }) => {
  //   setError(null)
  //   try {
  //     await onProfileUpdate({
  //       paymentMethods: data.paymentMethods,
  //       weekdayHours: data.weekdayHours,
  //       weekendHours: data.weekendHours
  //     })
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to save business settings')
  //     throw err
  //   }
  // }

  const handleGalleryChange = async (items: GalleryItem[]) => {
    setError(null)
    try {
      await onProfileUpdate({ gallery: items })
    } catch (err: any) {
      setError(err.message || 'Failed to save gallery')
      throw err
    }
  }

  const handleServicesSave = async (services: ServiceItem[]) => {
    setError(null)
    try {
      await onProfileUpdate({ services })
    } catch (err: any) {
      setError(err.message || 'Failed to save services')
      throw err
    }
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
        sectionId="professional-identity-section"
        isHighlighted={!isComplete && incompleteSectionIds.has('professional-identity-section')}
      />

      {/* 2. Service Categories */}
      <ServiceCategoriesSection
        serviceCategories={profile.serviceCategories || []}
        onSave={handleCategoriesSave}
        sectionId="service-categories-section"
        isHighlighted={!isComplete && incompleteSectionIds.has('service-categories-section')}
        suggestedCategories={suggestedCategories}
        wasAutoApplied={categoriesAutoApplied}
        onAutoAppliedDismiss={() => setCategoriesAutoApplied(false)}
      />

      {/* 3. Personal Information */}
      <PersonalInfoSection
        profile={profile}
        onSave={handlePersonalInfoSave}
      />

      {/* 4. Services & Pricing */}
      <ServicesPricingSection
        services={profile.services || []}
        onSave={handleServicesSave}
        maxServices={10}
      />

      {/* 5. Availability & Preferences - HIDDEN: Response time hardcoded on detail page */}
      {/* <AvailabilitySection
        responseTime={formatResponseTime(profile.responseTimeHours)}
        city={profile.city}
        country={profile.country}
        languages={profile.languages || []}
        onSave={handleAvailabilitySave}
        onLanguageChange={handleLanguageChange}
      /> */}

      {/* 6. Business Settings - HIDDEN: Not displayed anywhere */}
      {/* <BusinessSettingsSection
        paymentMethods={profile.paymentMethods || []}
        weekdayHours={profile.weekdayHours || { start: '08:00', end: '18:00' }}
        weekendHours={profile.weekendHours || { start: '09:00', end: '14:00' }}
        onSave={handleBusinessSettingsSave}
      /> */}

      {/* 7. Work Gallery (Premium Feature) */}
      <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-100 flex-shrink-0">
              <Camera className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.gallery.title')}</h3>
              <p className="text-xs text-gray-500 hidden sm:block">{t('profile.gallery.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-4 md:px-6">
          <PortfolioGalleryManager
            items={profile.gallery || []}
            onChange={handleGalleryChange}
            maxItems={5}
          />
        </CardBody>
      </Card>
    </div>
  )
}
