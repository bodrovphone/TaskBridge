'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Trophy, Star, X, PartyPopper } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AchievementBannerProps {
  isTopProfessional: boolean
  topProfessionalTasksCount: number
  isEarlyAdopter: boolean
  earlyAdopterCategories: string[]
}

const STORAGE_KEY = 'achievement_banner_dismissed'

export function AchievementBanner({
  isTopProfessional,
  topProfessionalTasksCount,
  isEarlyAdopter,
  earlyAdopterCategories,
}: AchievementBannerProps) {
  const t = useTranslations()
  const [isDismissed, setIsDismissed] = useState(true) // Start true to prevent flash

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true'
    setIsDismissed(dismissed)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  // Don't show if no badges or dismissed
  const hasBadges = isTopProfessional || isEarlyAdopter
  if (!hasBadges || isDismissed) {
    return null
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 shadow-lg overflow-hidden">
      <CardBody className="p-0">
        {/* Decorative confetti background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-2 left-10 text-2xl">🎉</div>
          <div className="absolute top-4 right-20 text-xl">✨</div>
          <div className="absolute bottom-2 left-1/4 text-lg">🌟</div>
          <div className="absolute bottom-3 right-10 text-xl">🎊</div>
        </div>

        <div className="relative p-5 sm:p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-amber-200/50 transition-colors text-amber-600"
            aria-label={t('common.dismiss')}
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <PartyPopper className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2">
                {t('profile.achievement.title')}
              </h3>

              <p className="text-amber-800 text-sm sm:text-base mb-4">
                {t('profile.achievement.subtitle')}
              </p>

              {/* Badges earned */}
              <div className="flex flex-wrap gap-2">
                {isTopProfessional && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-md">
                    <Trophy size={14} />
                    <span>{t('professionals.badge.topProfessionalLabel')}</span>
                    <span className="text-amber-100">({topProfessionalTasksCount} {t('profile.achievement.tasksCompleted')})</span>
                  </div>
                )}
                {isEarlyAdopter && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-md">
                    <Star size={14} className="fill-white" />
                    <span>{t('professionals.badge.earlyAdopterLabel')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
