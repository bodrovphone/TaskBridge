import { getTranslations } from 'next-intl/server'

/**
 * Server-rendered Hero Section for Professionals Page
 *
 * LCP OPTIMIZATION:
 * - Text content is SERVER RENDERED - visible in initial HTML
 * - No framer-motion animations blocking paint
 * - Instant gradient background (no lazy loading)
 * - Trust indicators render immediately
 */
export default async function ProfessionalsHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale })

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 text-center text-white">
        <div className="space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <div className="bg-white/10 rounded-full px-4 sm:px-6 py-2 border border-white/20 mb-4 sm:mb-6">
              <span className="text-sm sm:text-base text-blue-200 font-medium tracking-wide">
                ✨ {t('professionals.hero.badge')}
              </span>
            </div>
          </div>

          {/* Title - LCP ELEMENT */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            {t('professionals.hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
            {t('professionals.hero.subtitle')}
          </p>

          {/* Mobile: Compact inline trust indicators */}
          <div className="sm:hidden flex flex-wrap justify-center gap-3 mt-6">
            {[
              { icon: '✅', valueKey: 'professionals.hero.stats.verified.value' },
              { icon: '⭐', valueKey: 'professionals.hero.stats.ratings.value' },
              { icon: '🚀', valueKey: 'professionals.hero.stats.jobs.value' }
            ].map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-sm text-white/90 border border-white/20"
              >
                <span>{item.icon}</span>
                <span className="font-medium">{t(item.valueKey)}</span>
              </span>
            ))}
          </div>

          {/* Desktop: Full trust indicator cards */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto px-4">
            {[
              { icon: '✅', labelKey: 'professionals.hero.stats.verified.label', valueKey: 'professionals.hero.stats.verified.value' },
              { icon: '⭐', labelKey: 'professionals.hero.stats.ratings.label', valueKey: 'professionals.hero.stats.ratings.value' },
              { icon: '🚀', labelKey: 'professionals.hero.stats.jobs.label', valueKey: 'professionals.hero.stats.jobs.value' }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-xl px-4 py-4 border border-white/20 text-center"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-lg font-bold text-white">{t(item.valueKey)}</div>
                <div className="text-sm text-blue-200">{t(item.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
