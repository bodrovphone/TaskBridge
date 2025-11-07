'use client'

import { useTranslation } from 'react-i18next';
import ProfessionalHeader from '@/features/professionals/components/sections/professional-header';
import ActionButtonsRow from '@/features/professionals/components/sections/action-buttons-row';
import ServicesSection from '@/features/professionals/components/sections/services-section';
import PortfolioGallery from '@/features/professionals/components/sections/portfolio-gallery';
import CompletedTasksSection from '@/features/professionals/components/sections/completed-tasks-section';
import ReviewsSection from '@/features/professionals/components/sections/reviews-section';
import { SuspensionBanner } from '@/components/safety/suspension-banner';
import { getCityLabelBySlug } from '@/features/cities';

interface ProfessionalDetailPageContentProps {
  professional: any; // @todo: Add proper type from API
  lang: string;
}

export function ProfessionalDetailPageContent({ professional, lang }: ProfessionalDetailPageContentProps) {
  const { t } = useTranslation();

  // Transform API data to match component expectations
  const transformedProfessional = {
    id: professional.id,
    name: professional.fullName || professional.name,
    // Use professional_title as title, fallback to first service category or default
    title: professional.specialization || t('professionals.card.lookingForFirstTask', 'Professional service provider'),
    avatar: professional.avatarUrl || professional.avatar,
    rating: professional.rating || 0,
    reviewCount: professional.reviewsCount || professional.reviewCount || 0,
    completedTasks: professional.completedJobs || professional.completedTasks || 0,
    yearsExperience: professional.yearsExperience || 0,
    responseTime: professional.responseTime || "2 часа",
    // Show city if available, otherwise show "Bulgaria 🇧🇬" like on professional cards
    location: professional.city
      ? `${getCityLabelBySlug(professional.city, t)}${professional.neighborhood ? `, ${professional.neighborhood}` : ''}`
      : `${t('common.country.bulgaria', 'Bulgaria')} 🇧🇬`,
    isOnline: professional.isOnline || false,
    isVerified: {
      phone: professional.phoneVerified || false,
      id: professional.idVerified || professional.verified || false,
      address: professional.addressVerified || false
    },
    safetyStatus: professional.safetyStatus || {
      phoneVerified: professional.phoneVerified || false,
      profileComplete: true,
      policeCertificate: false,
      backgroundCheckPassed: false
    },
    bio: professional.bio || t('professionalDetail.defaultBio', 'Професионален специалист с опит в сферата.'),
    services: professional.services || [],
    portfolio: professional.portfolio || [],
    reviews: professional.reviews || [],
    contactSettings: professional.contactSettings || {
      allowDirectContact: true,
      preferredHours: "9:00 - 18:00",
      contactMethods: ["message", "phone"]
    },
    completedTasksList: professional.completedTasksList || professional.completedTasks || []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Suspension Banner (if account is suspended) */}
          {professional.isSuspended && (
            <SuspensionBanner suspensionReason={professional.suspensionReason} />
          )}

          {/* Professional Header */}
          <ProfessionalHeader professional={transformedProfessional} />

          {/* Two Column Layout - Equal Height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch">
            {/* Left Column - Action Buttons + Services */}
            <div className="flex flex-col gap-8">
              <ActionButtonsRow
                professional={transformedProfessional}
                onInviteToApply={() => console.log('Invite to apply clicked')}
                onShare={() => console.log('Share clicked')}
              />
              <ServicesSection services={transformedProfessional.services} />
            </div>

            {/* Right Column - About (Full Height) */}
            <div className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('professionalDetail.about')}
              </h3>
              <p className="text-gray-700 leading-relaxed flex-1">
                {transformedProfessional.bio}
              </p>
            </div>
          </div>

          {/* Reviews & Ratings - Always show */}
          <div id="reviews-section">
            <ReviewsSection reviews={transformedProfessional.reviews} />
          </div>

          {/* Portfolio Gallery - My Demos - Always show */}
          <PortfolioGallery portfolio={transformedProfessional.portfolio} />

          {/* Completed Tasks - Always show */}
          <CompletedTasksSection completedTasks={transformedProfessional.completedTasksList} />
        </div>
      </div>
    </div>
  );
}
