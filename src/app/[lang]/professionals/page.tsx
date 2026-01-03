import { Suspense } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ProfessionalsPage } from '@/features/professionals'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import { professionalService } from '@/server/professionals/professional.service'
import type { Professional } from '@/server/professionals/professional.types'
import ProfessionalsSkeleton from './skeleton'
import ProfessionalsHero from './hero'

/**
 * ISR Configuration - Incremental Static Regeneration
 * Featured professionals don't change frequently, so we cache for 1 hour
 * This provides instant page loads while keeping data reasonably fresh
 */
export const revalidate = 3600 // 1 hour

interface ProfessionalsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ProfessionalsPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('professionals', locale, '/professionals')
}

/**
 * Server-side data fetching for featured professionals
 * This runs at build time and on revalidation (every hour)
 */
async function getFeaturedProfessionals(lang: string) {
  try {
    const result = await professionalService.getFeaturedProfessionals(lang)

    if (!result.success) {
      console.error('[ProfessionalsPage SSR] Failed to fetch featured professionals:', result.error)
      return []
    }

    return result.data
  } catch (error) {
    console.error('[ProfessionalsPage SSR] Error fetching featured professionals:', error)
    return []
  }
}

/**
 * Server-rendered SEO content - visible to search engines in HTML source
 * Uses sr-only to hide from visual users while keeping content crawlable
 */
async function SEOProfessionalsContent({ professionals, locale }: { professionals: Professional[], locale: string }) {
  const t = await getTranslations({ locale })

  return (
    <div className="sr-only" aria-hidden="false">
      <h1>{t('professionals.hero.title')}</h1>
      <p>{t('professionals.hero.subtitle')}</p>

      <h2>{t('professionals.featuredTitle')}</h2>
      <ul>
        {professionals.slice(0, 10).map((pro) => (
          <li key={pro.id}>
            <article>
              <h3>{pro.full_name}</h3>
              {pro.professional_title && <p><strong>{pro.professional_title}</strong></p>}
              {pro.bio && <p>{pro.bio}</p>}
              <dl>
                {pro.city && (
                  <>
                    <dt>{t('task.location')}</dt>
                    <dd>{pro.city}</dd>
                  </>
                )}
                {pro.service_categories && pro.service_categories.length > 0 && (
                  <>
                    <dt>{t('professionals.filters.category')}</dt>
                    <dd>{pro.service_categories.join(', ')}</dd>
                  </>
                )}
                {pro.average_rating && (
                  <>
                    <dt>{t('professionals.rating')}</dt>
                    <dd>{pro.average_rating} / 5</dd>
                  </>
                )}
                {pro.tasks_completed !== undefined && pro.tasks_completed > 0 && (
                  <>
                    <dt>{t('professionals.card.completedJobs')}</dt>
                    <dd>{pro.tasks_completed}</dd>
                  </>
                )}
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ProfessionalsPageRoute({ params }: ProfessionalsPageProps) {
  const { lang } = await params

  // Fetch featured professionals on the server with locale for translations
  const initialFeaturedProfessionals = await getFeaturedProfessionals(lang)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* SEO content - crawlable by search engines */}
      <SEOProfessionalsContent professionals={initialFeaturedProfessionals} locale={lang} />

      {/* Hero - SERVER RENDERED outside Suspense for instant LCP */}
      <ProfessionalsHero locale={lang} />

      {/* Interactive client component - wrapped in Suspense for useSearchParams */}
      {/* IMPORTANT: Skeleton fallback prevents CLS (Cumulative Layout Shift) */}
      <Suspense fallback={<ProfessionalsSkeleton />}>
        <ProfessionalsPage initialFeaturedProfessionals={initialFeaturedProfessionals} />
      </Suspense>
    </div>
  )
}
