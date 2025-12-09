import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { professionalService } from '@/server/professionals/professional.service';
import { ProfessionalDetailPageContent } from './components/professional-detail-page-content';
import type { ProfessionalDetail } from '@/server/professionals/professional.types';

/**
 * ISR Revalidation: Cache for 60 seconds
 * This dramatically improves performance while keeping data reasonably fresh
 */
export const revalidate = 60;

interface ProfessionalPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

/**
 * Cached fetch function - React cache() deduplicates calls within a single request
 * Both generateMetadata and the page component will share the same result
 */
const getProfessional = cache(async (id: string, lang: string) => {
  const result = await professionalService.getProfessionalDetail(id, lang);

  if (!result.success || !result.data) {
    return null;
  }

  return result.data;
});

/**
 * Transform ProfessionalDetail to the format expected by the client component
 * This maps the repository data structure to the UI expectations
 */
function transformForClient(professional: ProfessionalDetail) {
  return {
    id: professional.id,
    fullName: professional.full_name,
    name: professional.full_name,
    avatarUrl: professional.avatar_url,
    avatar: professional.avatar_url,
    bio: professional.bio || 'Professional service provider',
    specialization: professional.professional_title,
    rating: professional.average_rating || 0,
    reviewsCount: professional.total_reviews || 0,
    completedJobs: professional.tasks_completed,
    yearsExperience: professional.years_experience || 0,
    city: professional.city,
    neighborhood: professional.neighborhood,
    isOnline: false, // Not tracked in current schema
    phoneVerified: professional.is_phone_verified,
    idVerified: professional.is_vat_verified,
    addressVerified: false, // Not in schema yet
    responseTime: professional.responseTime,
    services: professional.services,
    serviceCategories: professional.service_categories,
    gallery: professional.portfolio,
    reviews: professional.reviews,
    completedTasksList: professional.completedTasksList,
    safetyStatus: professional.safetyStatus,
    contactSettings: professional.contactSettings,
    // Badge fields
    is_top_professional: professional.is_top_professional,
    top_professional_tasks_count: professional.top_professional_tasks_count,
    top_professional_until: professional.top_professional_until,
    is_early_adopter: professional.is_early_adopter,
    early_adopter_categories: professional.early_adopter_categories,
    is_featured: professional.is_featured,
  };
}

export async function generateMetadata({ params }: ProfessionalPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const professional = await getProfessional(resolvedParams.id, resolvedParams.lang);

  if (!professional) {
    return {
      title: 'Professional Not Found',
    };
  }

  return {
    title: `${professional.full_name || 'Professional'} - ${professional.professional_title || 'Service Provider'}`,
    description: professional.bio || `View ${professional.full_name}'s professional services and reviews`,
  };
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
  const resolvedParams = await params;
  const professional = await getProfessional(resolvedParams.id, resolvedParams.lang);

  if (!professional) {
    notFound();
  }

  // Transform to client format
  const clientData = transformForClient(professional);

  return <ProfessionalDetailPageContent professional={clientData} lang={resolvedParams.lang} />;
}
