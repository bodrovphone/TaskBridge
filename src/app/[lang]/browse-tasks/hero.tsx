import { getTranslations } from 'next-intl/server'
import { Sparkles } from "lucide-react"
import { HeroVideoBackground } from './hero-video'

/**
 * Server-rendered Hero Section for Browse Tasks
 *
 * LCP OPTIMIZATION:
 * - Text content is SERVER RENDERED - visible in initial HTML
 * - Video background loads lazily on DESKTOP only (client component)
 * - Mobile gets instant gradient background (no video download)
 */
export default async function BrowseTasksHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale })

  return (
    <div className="relative overflow-hidden">
      {/* Gradient background - always visible, instant render */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600" />

      {/* Dark overlay - z-[2] to be above video (z-[1]) but below content (z-10) */}
      <div className="absolute inset-0 z-[2] bg-black/60" />

      {/* Content - FIRST in DOM order for fastest LCP paint */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 bg-white/20 rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">{t('browseTasks.hero.badge')}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              {t('browseTasks.hero.title1')}
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {t('browseTasks.hero.title2')}
              </span>
            </h1>

            {/* Subtitle - LCP ELEMENT */}
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed">
              {t('browseTasks.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Video - LAST in DOM, hydrates after text is painted */}
      <HeroVideoBackground />
    </div>
  )
}
