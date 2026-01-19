'use client'

import { memo, useMemo } from 'react';
import { Avatar, Badge, Chip } from "@heroui/react";
import { useParams } from 'next/navigation';
import { Star, MapPin } from "lucide-react";
import { useTranslations } from 'next-intl';
import { SafetyIndicators } from '../safety-indicators';
import { SafetyWarningBanner, type WarningType } from '../safety-warning-banner';
import { formatYearsExperience } from '@/lib/utils/pluralization';
import { getCategoryLabelBySlug } from '@/features/categories';
import { BadgeDisplay } from '../badges';

// Color palette for category chips - defined outside component to prevent recreation
const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-amber-100 text-amber-700',
] as const;

// Deterministic color picker based on string
function getCategoryColorIndex(category: string): number {
  return category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CATEGORY_COLORS.length;
}

interface ProfessionalHeaderProps {
 professional: API['ProfessionalDisplay'];
}

function ProfessionalHeaderComponent({ professional }: ProfessionalHeaderProps) {
 const t = useTranslations();
 const params = useParams();
 const currentLocale = (params?.lang as string) || 'bg';

 // Memoize warning type calculation
 const warningType: WarningType | null = useMemo(() => {
  if (professional.safetyStatus.multipleReports) return 'multiple_reports';
  if (professional.safetyStatus.hasNegativeReviews) return 'negative_reviews';
  return null;
 }, [professional.safetyStatus.multipleReports, professional.safetyStatus.hasNegativeReviews]);

 return (
  <div className="space-y-4">
   {/* Safety Warning Banner (if applicable) */}
   {warningType && (
    <SafetyWarningBanner type={warningType} />
   )}

   {/* Main Header Card */}
   <div className="bg-white/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
    <div className="flex flex-col lg:flex-row gap-6">
    {/* Avatar and Online Status */}
    <div className="relative flex-shrink-0 mx-auto lg:mx-0">
     {professional.isOnline ? (
      <Badge
       content=""
       color="success"
       shape="circle"
       placement="bottom-right"
       className="w-6 h-6 border-2 border-white"
      >
       <Avatar
        src={professional.avatar}
        name={professional.name}
        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-large"
       />
      </Badge>
     ) : (
      <Avatar
       src={professional.avatar}
       name={professional.name}
       className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-large"
      />
     )}
    </div>

    {/* Professional Info */}
    <div className="flex-1">
     <div className="flex flex-col gap-4">
      {/* Name and Title - Centered on mobile/tablet, left on desktop */}
      <div className="text-center lg:text-left">
       <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {professional.name}
       </h1>

       <p className="text-base sm:text-lg text-gray-600 mb-3">
        {professional.title}
       </p>

       {/* Service Categories - Primary info, what they DO */}
       {professional.serviceCategories && professional.serviceCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 justify-center lg:justify-start">
         {professional.serviceCategories.map((category) => (
          <Chip
           key={category}
           size="md"
           variant="flat"
           className={`${CATEGORY_COLORS[getCategoryColorIndex(category)]} font-medium`}
          >
           {getCategoryLabelBySlug(category, t)}
          </Chip>
         ))}
        </div>
       )}

       {/* Meta: Rating • Location • Status + Badges */}
       <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 text-sm text-gray-600 mb-3">
        {/* Badges - secondary, inline with meta */}
        <BadgeDisplay
         isTopProfessional={professional.isTopProfessional}
         topProfessionalTasksCount={professional.topProfessionalTasksCount}
         isEarlyAdopter={professional.isEarlyAdopter}
         earlyAdopterCategories={professional.earlyAdopterCategories}
         size="sm"
        />

        {/* Safety - compact icons */}
        <SafetyIndicators
         safetyStatus={professional.safetyStatus}
         mode="compact"
        />
        {professional.reviewCount > 0 ? (
          <button
           onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
           className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
           <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
           <span className="font-semibold text-gray-900">{professional.rating.toFixed(1)}</span>
           <span>({professional.reviewCount})</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-gray-500">
           <Star className="w-4 h-4 text-gray-400" />
           <span className="text-xs sm:text-sm">{t('professionals.card.waitingForReviews')}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
         <MapPin className="w-3.5 h-3.5 text-gray-400" />
         <span>{professional.location}</span>
        </div>

        <div className="flex items-center gap-1">
         <div className={`w-2 h-2 rounded-full ${professional.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
         <span className="text-xs sm:text-sm">{professional.isOnline ? t('professionalDetail.online') : t('professionalDetail.offline')}</span>
        </div>
       </div>
      </div>

      {/* Stats - Stack on mobile, 3 columns on sm+ */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6">
       <div className="flex flex-col sm:flex-row sm:justify-around gap-4 sm:gap-6 text-center">
        <div className="flex-1">
         {professional.completedTasks > 0 ? (
           <>
             <div className="text-xl sm:text-2xl font-bold text-blue-600">{professional.completedTasks}</div>
             <div className="text-xs sm:text-sm text-gray-600 leading-tight mt-1">{t('professionalDetail.stats.completedTasks')}</div>
           </>
         ) : (
           <>
             <div className="text-xl sm:text-2xl font-bold text-blue-500">0</div>
             <div className="text-xs sm:text-sm text-blue-600 leading-tight font-medium mt-1">{t('professionals.card.lookingForFirstTask')}</div>
           </>
         )}
        </div>
        <div className="flex-1">
         <div className="text-xl sm:text-2xl font-bold text-green-600">
          {formatYearsExperience(
            professional.yearsExperience,
            currentLocale,
            (key: string) => t(key as any)
          )}
         </div>
         <div className="text-xs sm:text-sm text-gray-600 leading-tight mt-1">{t('professionalDetail.stats.experience')}</div>
        </div>
        <div className="flex-1">
         <div className="text-xl sm:text-2xl font-bold text-purple-600">{t('profile.professional.responseTime.24h')}</div>
         <div className="text-xs sm:text-sm text-gray-600 leading-tight mt-1">{t('professionalDetail.stats.responseTime')}</div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
   </div>
  </div>
 );
}

// Export with React.memo for performance optimization
const ProfessionalHeader = memo(ProfessionalHeaderComponent);
export default ProfessionalHeader;