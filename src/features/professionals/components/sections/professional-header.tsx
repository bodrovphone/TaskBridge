'use client'

import { Avatar, Badge, Chip } from "@nextui-org/react";
import { useParams } from 'next/navigation';
import { Star, MapPin, Clock, CheckCircle, Shield, Phone, Users } from "lucide-react";
import { useTranslations } from 'next-intl';
import { SafetyIndicators, type SafetyStatus } from '../safety-indicators';
import { SafetyWarningBanner, type WarningType } from '../safety-warning-banner';
import { formatYearsExperience } from '@/lib/utils/pluralization';
import { getCategoryLabelBySlug } from '@/features/categories';
import { BadgeDisplay } from '../badges';

interface Professional {
 id: string;
 name: string;
 title: string;
 avatar: string;
 rating: number;
 reviewCount: number;
 completedTasks: number;
 yearsExperience: number;
 responseTime: string;
 location: string;
 isOnline: boolean;
 isVerified: {
  phone: boolean;
  id: boolean;
  address: boolean;
 };
 safetyStatus: SafetyStatus;
 serviceCategories?: string[];
 // Badge fields
 isTopProfessional?: boolean;
 topProfessionalTasksCount?: number;
 isEarlyAdopter?: boolean;
 earlyAdopterCategories?: string[];
}

interface ProfessionalHeaderProps {
 professional: Professional;
}

export default function ProfessionalHeader({ professional }: ProfessionalHeaderProps) {
 const t = useTranslations();
 const params = useParams();
 const currentLocale = (params?.lang as string) || 'bg';

 // Determine which warning to show (prioritize multiple reports over negative reviews)
 const warningType: WarningType | null = professional.safetyStatus.multipleReports
  ? 'multiple_reports'
  : professional.safetyStatus.hasNegativeReviews
  ? 'negative_reviews'
  : null;

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

       {/* Professional Badges */}
       <BadgeDisplay
        isTopProfessional={professional.isTopProfessional}
        topProfessionalTasksCount={professional.topProfessionalTasksCount}
        isEarlyAdopter={professional.isEarlyAdopter}
        earlyAdopterCategories={professional.earlyAdopterCategories}
        size="md"
        className="mb-4 justify-center lg:justify-start"
       />

       {/* Service Categories / Skills */}
       {professional.serviceCategories && professional.serviceCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center lg:justify-start">
         {professional.serviceCategories.map((category, index) => {
          const colors = [
           'bg-blue-100 text-blue-700',
           'bg-green-100 text-green-700',
           'bg-purple-100 text-purple-700',
           'bg-orange-100 text-orange-700',
           'bg-pink-100 text-pink-700',
           'bg-teal-100 text-teal-700',
           'bg-indigo-100 text-indigo-700',
           'bg-amber-100 text-amber-700',
          ];
          // Use category string to deterministically pick color (same category = same color)
          const colorIndex = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
          return (
           <Chip
            key={category}
            size="sm"
            variant="flat"
            className={colors[colorIndex]}
           >
            {getCategoryLabelBySlug(category, t)}
           </Chip>
          );
         })}
        </div>
       )}

       {/* Safety & Verification Indicators */}
       <SafetyIndicators
        safetyStatus={professional.safetyStatus}
        mode="badges"
        className="mb-4 justify-center lg:justify-start"
       />

       {/* Rating and Location */}
       <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 mb-4">
        {professional.reviewCount > 0 ? (
          <button
           onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
           className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
           <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
           <span className="font-semibold text-gray-900">{professional.rating.toFixed(1)}</span>
           <span>({professional.reviewCount} {t('professionalDetail.reviews')})</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-gray-500">
           <Star className="w-4 h-4 text-gray-400" />
           <span className="font-medium">{t('professionals.card.waitingForReviews')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
         <MapPin className="w-4 h-4 text-gray-400" />
         <span>{professional.location}</span>
        </div>

        <div className="flex items-center gap-1">
         <div className={`w-2 h-2 rounded-full ${professional.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
         <span>{professional.isOnline ? t('professionalDetail.online') : t('professionalDetail.offline')}</span>
        </div>
       </div>
      </div>

      {/* Stats - Full width on mobile/tablet, inline on desktop */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6">
       <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
        <div>
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
        <div>
         <div className="text-xl sm:text-2xl font-bold text-green-600">
          {formatYearsExperience(
            professional.yearsExperience,
            currentLocale,
            (key: string) => t(key as any)
          )}
         </div>
         <div className="text-xs sm:text-sm text-gray-600 leading-tight mt-1">{t('professionalDetail.stats.experience')}</div>
        </div>
        <div>
         <div className="text-xl sm:text-2xl font-bold text-purple-600">{professional.responseTime}</div>
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