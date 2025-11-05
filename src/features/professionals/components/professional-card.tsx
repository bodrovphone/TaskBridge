'use client'

import { motion } from "framer-motion"
import { useTranslation } from 'react-i18next'
import {
 Card as NextUICard,
 CardBody,
 Button as NextUIButton,
 Chip
} from "@nextui-org/react"
import { Star, MapPin, Clock, Briefcase } from "lucide-react"
import FallbackAvatar from "@/components/ui/fallback-avatar"
import { getCategoryLabelBySlug } from '@/features/categories'
import { LocaleLink } from '@/components/common/locale-link'
import type { Professional as APIProfessional } from '@/server/professionals/professional.types'
import type { Professional as MockProfessional } from '../lib/mock-professionals'
import { SafetyIndicators } from './safety-indicators'

// @todo CLEANUP: Remove MockProfessional when mock data is removed - use only APIProfessional
type ProfessionalCardData = APIProfessional | MockProfessional

interface ProfessionalCardProps {
 professional: ProfessionalCardData
 featured?: boolean
 isMock?: boolean  // Flag to indicate this is mock data for reference
}

export default function ProfessionalCard({ professional, featured = false, isMock = false }: ProfessionalCardProps) {
 const { t } = useTranslation()

 // @todo CLEANUP: Remove this helper when mock data is removed
 // Helper to safely access fields that have different names in API vs Mock
 const getName = () => ('full_name' in professional ? professional.full_name : professional.name) || 'Unknown'
 const getAvatar = () => ('avatar_url' in professional ? professional.avatar_url : professional.avatar) || undefined
 const getRating = () => ('average_rating' in professional ? professional.average_rating : professional.rating) || 0
 const getReviewsCount = () => ('total_reviews' in professional ? professional.total_reviews : professional.reviewsCount) || 0
 const getCompletedJobs = () => ('tasks_completed' in professional ? professional.tasks_completed : professional.completedJobs) || 0
 const getCategories = () => ('service_categories' in professional ? professional.service_categories : professional.categories) || []
 const getLocation = () => ('city' in professional ? professional.city : professional.location) || 'Unknown'
 const getBio = () => ('bio' in professional ? professional.bio : professional.description) || ''
 const getVerified = () => {
   if ('is_phone_verified' in professional) {
     return professional.is_phone_verified || professional.is_email_verified
   }
   return professional.verified
 }

 return (
  <div
   className="group hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300 ease-out will-change-transform"
  >
   <NextUICard className="professional-card bg-white shadow-lg hover:shadow-2xl transition-all duration-500 relative border border-gray-100 group-hover:border-blue-200 overflow-hidden">
    {/* Mock badge - shows for reference data */}
    {isMock && (
     <div className="absolute top-0 left-0 z-20">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-br-xl font-bold text-xs shadow-lg">
       🎭 MOCK
      </div>
     </div>
    )}

    {/* Enhanced featured badge */}
    {professional.featured && (
     <div className="absolute top-0 right-0 z-20">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-bl-xl font-bold text-xs shadow-lg">
       ⭐ FEATURED
      </div>
     </div>
    )}
    
    {/* Hover effect overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 z-10 pointer-events-none"></div>
    
    <CardBody className="p-6 relative z-10">
     {/* Enhanced Header */}
     <div className="flex items-start gap-4 mb-6">
      <LocaleLink href={`/professionals/${professional.id}`} className="relative group">
       <div className="hover:scale-110 transition-transform duration-200">
        <FallbackAvatar
         src={getAvatar()}
         name={getName()}
         size="lg"
         className=""
        />
       </div>
       {getVerified() && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-1 shadow-lg w-5 h-5 flex items-center justify-center animate-in fade-in zoom-in duration-300">
         <span className="text-white text-[10px] font-bold">✓</span>
        </div>
       )}
      </LocaleLink>

      <div className="flex-1 min-w-0">
       <LocaleLink href={`/professionals/${professional.id}`}>
        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 hover:text-blue-600 transition-colors truncate cursor-pointer">
         {getName()}
        </h3>
       </LocaleLink>
       <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
         <Star className="text-yellow-500 fill-current" size={16} />
         <span className="font-bold text-gray-900">{getRating()}</span>
         <span className="text-gray-600 text-sm">({getReviewsCount()})</span>
        </div>
        {/* Safety Indicators - Compact Mode */}
        {('safetyStatus' in professional) && (
          <SafetyIndicators
           safetyStatus={professional.safetyStatus}
           mode="compact"
          />
        )}
       </div>
       <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
        <Briefcase size={14} className="text-blue-500" />
        <span className="font-semibold text-blue-600">{getCompletedJobs()}</span>
        <span>completed jobs</span>
       </div>
      </div>
     </div>

     {/* Enhanced Categories */}
     <div className="flex flex-wrap gap-2 mb-4">
      {getCategories().slice(0, 2).map((category, index) => (
       <div
        key={`${professional.id}-category-${index}`}
        className="animate-in fade-in zoom-in duration-300"
        style={{ animationDelay: `${0.1 + (index * 0.1)}s`, animationFillMode: 'backwards' }}
       >
        <Chip
         size="sm"
         variant="flat"
         color="primary"
         className="font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
        >
         {getCategoryLabelBySlug(category, t)}
        </Chip>
       </div>
      ))}
      {getCategories().length > 2 && (
       <Chip
        size="sm"
        variant="flat"
        color="default"
        className="bg-gray-100 text-gray-600 font-medium"
       >
        +{getCategories().length - 2}
       </Chip>
      )}
     </div>

     {/* Enhanced Description */}
     <p className="text-gray-700 text-sm mb-4 leading-relaxed group-hover:text-gray-800 transition-colors">
      {getBio()}
     </p>

     {/* Skills Section */}
     {('skills' in professional) && professional.skills && professional.skills.length > 0 && (
      <div className="mb-4">
       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</h4>
       <div className="flex flex-wrap gap-1">
        {professional.skills.slice(0, 3).map((skill, index) => (
         <Chip
          key={skill}
          size="sm"
          variant="flat"
          color="secondary"
          className="text-xs bg-purple-100 text-purple-700 border border-purple-200"
         >
          {skill}
         </Chip>
        ))}
        {professional.skills.length > 3 && (
         <Chip size="sm" variant="flat" color="default" className="text-xs bg-gray-100 text-gray-600">
          +{professional.skills.length - 3}
         </Chip>
        )}
       </div>
      </div>
     )}

     {/* Certifications */}
     {('certifications' in professional) && professional.certifications && professional.certifications.length > 0 && (
      <div className="mb-4">
       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Certifications</h4>
       <div className="space-y-1">
        {professional.certifications.slice(0, 2).map((cert) => (
         <div key={cert} className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {cert}
         </div>
        ))}
       </div>
      </div>
     )}

     {/* Languages */}
     {('languages' in professional) && professional.languages && professional.languages.length > 0 && (
      <div className="mb-4">
       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Languages</h4>
       <p className="text-xs text-gray-600">{professional.languages.join(', ')}</p>
      </div>
     )}

     {/* Enhanced Details */}
     <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
       <div className="p-1 bg-blue-100 rounded-md">
        <MapPin size={14} className="text-blue-600" />
       </div>
       <span className="text-gray-700 font-medium">{getLocation()}</span>
      </div>
      {('availability' in professional) && (
        <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-50 group-hover:bg-green-50 transition-colors">
         <div className="p-1 bg-green-100 rounded-md">
          <Clock size={14} className="text-green-600" />
         </div>
         <span className="text-gray-700">{professional.availability}</span>
        </div>
      )}
      {('priceRange' in professional) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
         <div className="flex items-center justify-between">
          <span className="text-xs text-green-600 uppercase tracking-wide font-semibold">Starting from</span>
          <span className="font-bold text-green-700 text-lg">{professional.priceRange}</span>
         </div>
        </div>
      )}
      {('hourly_rate_bgn' in professional) && professional.hourly_rate_bgn && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
         <div className="flex items-center justify-between">
          <span className="text-xs text-green-600 uppercase tracking-wide font-semibold">Hourly Rate</span>
          <span className="font-bold text-green-700 text-lg">{professional.hourly_rate_bgn} лв/час</span>
         </div>
        </div>
      )}
     </div>

     {/* Enhanced Action */}
     <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150">
      <LocaleLink href={`/professionals/${professional.id}`} className="block">
       <NextUIButton
        color="primary"
        variant="shadow"
        size="lg"
        className="w-full font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 group-hover:shadow-xl"
        endContent={
         <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          →
         </span>
        }
       >
        {t('professionals.viewProfile')}
       </NextUIButton>
      </LocaleLink>
     </div>
    </CardBody>
   </NextUICard>
  </div>
 )
}