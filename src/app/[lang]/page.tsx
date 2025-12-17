import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LandingPage } from '@/features/home'
import { getFeaturedTasks } from '@/lib/data/featured-tasks'
import { ProfessionalService } from '@/server/professionals/professional.service'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, DEFAULT_LOCALE } from '@/lib/constants/locales'

// Force static generation at build time (equivalent to getStaticProps)
export const dynamic = 'force-static'

// Revalidate every 2 hours (ISR - Incremental Static Regeneration)
// This means the page is rebuilt at most once every 2 hours when requested
export const revalidate = 7200 // 2 hours = 2 * 60 * 60 seconds

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('home', locale, '')
}

/**
 * Server-rendered SEO content - this text will be in the HTML source for search engines
 */
async function SEOContent({ locale }: { locale: string }) {
  const t = await getTranslations({ locale })

  return (
    <div className="sr-only" aria-hidden="false">
      {/* Hero section text for SEO */}
      <h1>{t('landing.hero.title')}</h1>
      <p>{t('landing.hero.subtitle')}</p>
      <p>{t('landing.hero.badge')}</p>

      {/* Trust indicators */}
      <h2>{t('landing.trustIndicators.verified')}</h2>
      <p>{t('landing.trustIndicators.verifiedDescription')}</p>
      <h2>{t('landing.trustIndicators.freeToUse')}</h2>
      <p>{t('landing.trustIndicators.freeToUseDescription')}</p>
      <h2>{t('landing.trustIndicators.instantNotifications')}</h2>
      <p>{t('landing.trustIndicators.instantNotificationsDescription')}</p>

      {/* Categories section */}
      <h2>{t('landing.categories.title')}</h2>
      <p>{t('landing.categories.subtitle')}</p>

      {/* How it works */}
      <h2>{t('landing.howItWorks.title')}</h2>
      <p>{t('landing.howItWorks.subtitle')}</p>

      {/* CTA */}
      <h2>{t('landing.cta.title')}</h2>
      <p>{t('landing.cta.subtitle')}</p>
    </div>
  )
}

async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) ?? DEFAULT_LOCALE

  // Enable static rendering for this locale
  setRequestLocale(locale)

  // Fetch featured tasks and professionals at build time (SSG with ISR)
  const professionalService = new ProfessionalService()

  const [featuredTasks, professionalsResult] = await Promise.all([
    getFeaturedTasks(),
    professionalService.getFeaturedProfessionals()
  ])

  // Extract professionals from service result, default to empty array on error
  const featuredProfessionals = professionalsResult.success ? professionalsResult.data : []

  return (
    <>
      {/* Server-rendered SEO content (visually hidden but in HTML source) */}
      <SEOContent locale={locale} />

      {/* Client-rendered interactive landing page */}
      <LandingPage featuredTasks={featuredTasks} featuredProfessionals={featuredProfessionals} />
    </>
  )
}

HomePage.displayName = 'HomePage';

export default HomePage;
