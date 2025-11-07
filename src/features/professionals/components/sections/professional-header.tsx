'use client'

import { Avatar, Badge, Chip } from "@nextui-org/react";
import { Star, MapPin, Clock, CheckCircle, Shield, Phone, Users } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { SafetyIndicators, type SafetyStatus } from '../safety-indicators';
import { SafetyWarningBanner, type WarningType } from '../safety-warning-banner';
import { formatYearsExperience } from '@/lib/utils/pluralization';

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
}

interface ProfessionalHeaderProps {
 professional: Professional;
}

export default function ProfessionalHeader({ professional }: ProfessionalHeaderProps) {
 const { t, i18n } = useTranslation();

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
   <div className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-100">
    <div className="flex flex-col md:flex-row gap-6">
    {/* Avatar and Online Status */}
    <div className="relative flex-shrink-0">
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
        className="w-32 h-32 text-large"
       />
      </Badge>
     ) : (
      <Avatar
       src={professional.avatar}
       name={professional.name}
       className="w-32 h-32 text-large"
      />
     )}
    </div>

    {/* Professional Info */}
    <div className="flex-1">
     <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      {/* Name and Title */}
      <div>
       <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {professional.name}
       </h1>

       <p className="text-lg text-gray-600 mb-4">
        {professional.title}
       </p>

       {/* Safety & Verification Indicators */}
       <SafetyIndicators
        safetyStatus={professional.safetyStatus}
        mode="badges"
        className="mb-4"
       />

       {/* Rating and Location */}
       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
        {professional.reviewCount > 0 ? (
          <button
           onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
           className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
           <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
           <span className="font-semibold text-gray-900">{professional.rating}</span>
           <span>({professional.reviewCount} {t('professionalDetail.reviews')})</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-gray-500">
           <Star className="w-4 h-4 text-gray-400" />
           <span className="font-medium">{t('professionals.card.waitingForReviews', 'Waiting for first reviews')}</span>
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

      {/* Stats */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 min-w-fit">
       <div className="grid grid-cols-3 gap-4 text-center">
        <div>
         {professional.completedTasks > 0 ? (
           <>
             <div className="text-xl font-bold text-blue-600">{professional.completedTasks}</div>
             <div className="text-xs text-gray-600 leading-tight">{t('professionalDetail.stats.completedTasks')}</div>
           </>
         ) : (
           <>
             <div className="text-xl font-bold text-blue-500">0</div>
             <div className="text-xs text-blue-600 leading-tight font-medium">{t('professionals.card.lookingForFirstTask', 'Ready for first task')}</div>
           </>
         )}
        </div>
        <div>
         <div className="text-xl font-bold text-green-600">
          {formatYearsExperience(professional.yearsExperience, i18n.language, t)}
         </div>
         <div className="text-xs text-gray-600 leading-tight">{t('professionalDetail.stats.experience', 'Experience')}</div>
        </div>
        <div>
         <div className="text-xl font-bold text-purple-600">{professional.responseTime}</div>
         <div className="text-xs text-gray-600 leading-tight">{t('professionalDetail.stats.responseTime')}</div>
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