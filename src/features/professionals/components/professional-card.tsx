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
import { getCategoryLabel } from '@/lib/constants/categories'
import type { Professional } from '../lib/mock-professionals'

interface ProfessionalCardProps {
  professional: Professional
  featured?: boolean
}

export default function ProfessionalCard({ professional, featured = false }: ProfessionalCardProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <NextUICard className="professional-card bg-white shadow-lg hover:shadow-2xl transition-all duration-500 relative border border-gray-100 group-hover:border-blue-200 overflow-hidden">
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
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <FallbackAvatar
                  src={professional.avatar}
                  name={professional.name}
                  size="lg"
                  className=""
                />
              </motion.div>
              {professional.verified && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-1 shadow-lg w-5 h-5 flex items-center justify-center"
                >
                  <span className="text-white text-[10px] font-bold">✓</span>
                </motion.div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition-colors truncate">
                {professional.name}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="text-yellow-500 fill-current" size={16} />
                  <span className="font-bold text-gray-900">{professional.rating}</span>
                  <span className="text-gray-600 text-sm">({professional.reviewsCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                <Briefcase size={14} className="text-blue-500" />
                <span className="font-semibold text-blue-600">{professional.completedJobs}</span>
                <span>completed jobs</span>
              </div>
            </div>
          </div>

          {/* Enhanced Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {professional.categories.slice(0, 2).map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
              >
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
                >
                  {getCategoryLabel(category, t)}
                </Chip>
              </motion.div>
            ))}
            {professional.categories.length > 2 && (
              <Chip 
                size="sm" 
                variant="flat" 
                color="default"
                className="bg-gray-100 text-gray-600 font-medium"
              >
                +{professional.categories.length - 2}
              </Chip>
            )}
          </div>

          {/* Enhanced Description */}
          <p className="text-gray-700 text-sm mb-4 leading-relaxed group-hover:text-gray-800 transition-colors">
            {professional.description}
          </p>

          {/* Skills Section */}
          {professional.skills && professional.skills.length > 0 && (
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
          {professional.certifications && professional.certifications.length > 0 && (
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
          {professional.languages && professional.languages.length > 0 && (
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
              <span className="text-gray-700 font-medium">{professional.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-50 group-hover:bg-green-50 transition-colors">
              <div className="p-1 bg-green-100 rounded-md">
                <Clock size={14} className="text-green-600" />
              </div>
              <span className="text-gray-700">{professional.availability}</span>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 uppercase tracking-wide font-semibold">Starting from</span>
                <span className="font-bold text-green-700 text-lg">{professional.priceRange}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Action */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <NextUIButton
              color="primary"
              variant="shadow"
              size="lg"
              className="w-full font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 group-hover:shadow-xl"
              endContent={
                <motion.div
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.div>
              }
            >
              {t('professionals.viewProfile')}
            </NextUIButton>
          </motion.div>
        </CardBody>
      </NextUICard>
    </motion.div>
  )
}