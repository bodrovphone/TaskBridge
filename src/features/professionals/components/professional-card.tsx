'use client'

import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'
import {
 Card as NextUICard,
 CardBody,
 Button as NextUIButton,
 Chip
} from "@nextui-org/react"
import { Star, MapPin, Clock, Briefcase } from "lucide-react"
import FallbackAvatar from "@/components/ui/fallback-avatar"
import { getCategoryLabelBySlug } from '@/features/categories'
import { getCityLabelBySlug } from '@/features/cities'
import { LocaleLink } from '@/components/common/locale-link'
import type { Professional } from '@/server/professionals/professional.types'
import { BadgeDisplay } from './badges'

/**
 * Obfuscates a name for privacy: "John Smith" → "John S."
 * Handles names with usernames in parentheses: "Игорь Гладков (igor)" → "Игорь Г."
 */
function obfuscateName(fullName: string): string {
  // Remove anything in parentheses (usernames, etc.)
  const cleanName = fullName.replace(/\s*\([^)]*\)\s*/g, '').trim()
  const parts = cleanName.split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return fullName
  if (parts.length === 1) return parts[0]
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  return `${firstName} ${lastInitial}.`
}

interface ProfessionalCardProps {
 professional: Professional
 featured?: boolean
 isMock?: boolean  // Flag to indicate this is mock data for reference
 compact?: boolean // Compact mode: truncated bio, fixed height (for landing page)
 actionText?: string // Custom button text (e.g., "Suggest a task")
}

export default function ProfessionalCard({ professional, featured = false, isMock = false, compact = false, actionText }: ProfessionalCardProps) {
 const t = useTranslations()

 // Direct access to API Professional properties
 const fullName = professional.full_name || 'Unknown'
 const name = obfuscateName(fullName)
 const avatar = professional.avatar_url || undefined
 const rating = professional.average_rating || 0
 const reviewsCount = professional.total_reviews || 0
 const completedJobs = professional.tasks_completed || 0
 const categories = professional.service_categories || []
 const location = professional.city
   ? getCityLabelBySlug(professional.city, t)
   : `${t('common.country.bulgaria')} 🇧🇬`
 const bio = professional.bio || ''
 const title = professional.professional_title || ''
 const isVerified = professional.is_phone_verified || professional.is_email_verified

 return (
  <div
   className={`group transition-shadow duration-300 ease-out ${compact ? 'h-full' : ''}`}
  >
   <NextUICard className={`professional-card bg-white shadow-lg hover:shadow-2xl transition-all duration-300 relative border border-gray-100 group-hover:border-blue-300 overflow-hidden ${compact ? 'h-full' : ''}`}>
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
    
    <CardBody className={`p-6 relative z-10 ${compact ? 'h-full flex flex-col' : ''}`}>
     {/* Enhanced Header */}
     <div className="flex items-start gap-4 mb-4">
      <LocaleLink href={`/professionals/${professional.id}`} className="relative group">
       <div className="hover:scale-110 transition-transform duration-200">
        <FallbackAvatar
         src={avatar}
         name={fullName}
         size="lg"
         userId={professional.id}
         className=""
        />
       </div>
       {isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-1 shadow-lg w-5 h-5 flex items-center justify-center animate-in fade-in zoom-in duration-300">
         <span className="text-white text-[10px] font-bold">✓</span>
        </div>
       )}
      </LocaleLink>

      <div className="flex-1 min-w-0">
       <LocaleLink href={`/professionals/${professional.id}`} className="block">
        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 hover:text-blue-600 transition-colors cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-[180px] sm:max-w-[220px]">
         {name}
        </h3>
       </LocaleLink>
       {title && (
        <p className="text-sm text-gray-600 mb-1 truncate max-w-[200px]">{title}</p>
       )}
       <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
         <Star className="text-yellow-500 fill-current" size={16} />
         <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
         {reviewsCount > 0 && (
           <span className="text-gray-600 text-sm">({reviewsCount})</span>
         )}
        </div>
        {completedJobs === 0 ? (
          <span className="text-sm font-medium text-blue-600">{t('professionals.card.lookingForFirstTask')}</span>
        ) : (
          <div className="flex items-center gap-1 text-sm text-gray-600">
           <Briefcase size={14} className="text-blue-500 flex-shrink-0" />
           <span className="font-semibold text-blue-600">{completedJobs}</span>
           <span>{t('professionals.card.completedJobsShort')}</span>
          </div>
        )}
       </div>
      </div>
     </div>

     {/* Professional Badges */}
     <BadgeDisplay
      isTopProfessional={professional.is_top_professional}
      topProfessionalTasksCount={professional.top_professional_tasks_count}
      isEarlyAdopter={professional.is_early_adopter}
      earlyAdopterCategories={professional.early_adopter_categories}
      size="sm"
      className="mb-4"
     />

     {/* Enhanced Categories */}
     <div className="flex flex-wrap gap-2 mb-4 overflow-hidden">
      {categories.slice(0, 2).map((category, index) => (
       <div
        key={`${professional.id}-category-${index}`}
        className="animate-in fade-in zoom-in duration-300 max-w-[calc(50%-4px)]"
        style={{ animationDelay: `${0.1 + (index * 0.1)}s`, animationFillMode: 'backwards' }}
       >
        <Chip
         size="sm"
         variant="flat"
         color="primary"
         className="font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors max-w-full"
        >
         <span className="truncate block max-w-[120px]">
          {getCategoryLabelBySlug(category, t)}
         </span>
        </Chip>
       </div>
      ))}
      {categories.length > 2 && (
       <Chip
        size="sm"
        variant="flat"
        color="default"
        className="bg-gray-100 text-gray-600 font-medium"
       >
        +{categories.length - 2}
       </Chip>
      )}
     </div>

     {/* Enhanced Description */}
     <p className={`text-gray-700 text-sm mb-4 leading-relaxed group-hover:text-gray-800 transition-colors ${compact ? 'line-clamp-2' : 'line-clamp-6'}`}>
      {bio || (compact ? '' : t('professionals.card.noBio'))}
     </p>

     {/* Enhanced Details */}
     <div className={`space-y-4 mb-8 ${compact ? 'flex-grow' : ''}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
       <MapPin size={14} className="text-blue-500" />
       <span>{location}</span>
      </div>
      {professional.hourly_rate_bgn && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
         <div className="flex items-center justify-between">
          <span className="text-xs text-green-600 uppercase tracking-wide font-semibold">Hourly Rate</span>
          <span className="font-bold text-green-700 text-lg">{professional.hourly_rate_bgn} €/час</span>
         </div>
        </div>
      )}
     </div>

     {/* Enhanced Action */}
     <NextUIButton
      as={LocaleLink}
      href={`/professionals/${professional.id}`}
      color="primary"
      variant="shadow"
      size="lg"
      className="w-full font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 group-hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transform"
      endContent={
       <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
        →
       </span>
      }
     >
      {actionText || t('professionals.viewProfile')}
     </NextUIButton>
    </CardBody>
   </NextUICard>
  </div>
 )
}