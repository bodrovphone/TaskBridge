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

interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  isVerified: boolean
  isProfessional: boolean
  completionRate: number
}

interface ProfessionalProfileProps {
  user: User
}

export function ProfessionalProfile({ }: ProfessionalProfileProps) {
  const { t } = useTranslation()

  // Mock professional data
  const [professionalData, setProfessionalData] = useState({
    title: 'Professional Cleaning & Home Services',
    bio: 'Experienced home service professional with 5 years of expertise. I specialize in deep cleaning, regular maintenance, and use eco-friendly products with my own equipment.',
    yearsExperience: '5-10',
    serviceCategories: [] as string[], // Empty for new professionals - shows CTA
    availability: 'available' as 'available' | 'busy' | 'unavailable',
    responseTime: '2h',
    serviceArea: ['Sofia', 'Plovdiv'],
    isPhoneVerified: true,
    paymentMethods: ['cash', 'bank_transfer', 'card'],
    languages: ['bg', 'en'],
    weekdayHours: { start: '08:00', end: '18:00' },
    weekendHours: { start: '09:00', end: '14:00' },
    // Portfolio
    portfolio: [
      {
        id: '1',
        title: 'Deep apartment cleaning - 2 bedroom',
        beforeImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
        afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        description: 'Complete deep cleaning of a 2-bedroom apartment including kitchen and bathroom.',
        duration: '4 hours',
        tags: ['deep_cleaning', 'house_cleaning']
      }
    ],
    // Statistics (read-only)
    completedTasks: 89,
    averageRating: 4.9,
    totalEarnings: 3200,
    profileViews: 156,
    memberSince: '2023-01-15'
  })

  // Handlers for each section
  const handleIdentitySave = async (data: { title: string; bio: string; yearsExperience: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Saving identity:', data)
    setProfessionalData(prev => ({ ...prev, ...data }))
  }

  const handleCategoriesSave = (categories: string[]) => {
    setProfessionalData(prev => ({ ...prev, serviceCategories: categories }))
  }

  const handleVerifyPhone = () => {
    console.log('Verify phone clicked')
    // TODO: Implement phone verification
  }

  const handleAvailabilitySave = async (data: {
    availability: string
    responseTime: string
    serviceArea: string[]
  }) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Saving availability:', data)
    setProfessionalData(prev => ({
      ...prev,
      availability: data.availability as 'available' | 'busy' | 'unavailable',
      responseTime: data.responseTime,
      serviceArea: data.serviceArea
    }))
  }

  const handleLanguageChange = (languages: string[]) => {
    setProfessionalData(prev => ({ ...prev, languages }))
  }

  const handleBusinessSettingsSave = (data: {
    paymentMethods: string[]
    weekdayHours: { start: string; end: string }
    weekendHours: { start: string; end: string }
  }) => {
    setProfessionalData(prev => ({ ...prev, ...data }))
  }

  const handlePortfolioChange = (items: any[]) => {
    setProfessionalData(prev => ({ ...prev, portfolio: items }))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1. Professional Identity */}
      <ProfessionalIdentitySection
        title={professionalData.title}
        bio={professionalData.bio}
        yearsExperience={professionalData.yearsExperience}
        onSave={handleIdentitySave}
      />

      {/* 2. Service Categories */}
      <ServiceCategoriesSection
        serviceCategories={professionalData.serviceCategories}
        onSave={handleCategoriesSave}
      />

      {/* 3. Verification & Trust */}
      <VerificationSection
        isPhoneVerified={professionalData.isPhoneVerified}
        onVerifyPhone={handleVerifyPhone}
      />

      {/* 4. Availability & Preferences */}
      <AvailabilitySection
        availability={professionalData.availability}
        responseTime={professionalData.responseTime}
        serviceArea={professionalData.serviceArea}
        languages={professionalData.languages}
        onSave={handleAvailabilitySave}
        onLanguageChange={handleLanguageChange}
      />

      {/* 5. Business Settings */}
      <BusinessSettingsSection
        paymentMethods={professionalData.paymentMethods}
        weekdayHours={professionalData.weekdayHours}
        weekendHours={professionalData.weekendHours}
        onSave={handleBusinessSettingsSave}
      />

      {/* 6. Portfolio Gallery */}
      <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
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
            items={professionalData.portfolio}
            onChange={handlePortfolioChange}
            maxItems={6}
          />
        </CardBody>
      </Card>

      {/* 7. Statistics (Read-Only) */}
      <StatisticsSection
        completedTasks={professionalData.completedTasks}
        averageRating={professionalData.averageRating}
        totalEarnings={professionalData.totalEarnings}
        profileViews={professionalData.profileViews}
        memberSince={professionalData.memberSince}
      />
    </div>
  )
}
