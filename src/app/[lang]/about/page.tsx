import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { Shield, Eye, Scale, Award } from 'lucide-react'
import {
  ContentPageHero,
  ContentSection,
  StatsSection,
  CTASection,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface AboutPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('about', locale, '/about')
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: t('about.values.trust'),
      description: t('about.values.trustDesc'),
    },
    {
      icon: <Eye className="w-8 h-8 text-blue-600" />,
      title: t('about.values.transparency'),
      description: t('about.values.transparencyDesc'),
    },
    {
      icon: <Scale className="w-8 h-8 text-blue-600" />,
      title: t('about.values.fairness'),
      description: t('about.values.fairnessDesc'),
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: t('about.values.quality'),
      description: t('about.values.qualityDesc'),
    },
  ]

  const stats = [
    { value: '500+', label: t('about.stats.professionals') },
    { value: '1,000+', label: t('about.stats.tasks') },
    { value: '8', label: t('about.stats.cities') },
    { value: '98%', label: t('about.stats.satisfaction') },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${locale}` },
          { name: t('about.hero.title'), url: `/${locale}/about` },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('about.hero.title')}
        subtitle={t('about.hero.subtitle')}
      />

      {/* The Problem */}
      <ContentSection variant="default">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('about.problem.title')}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('about.problem.description')}
          </p>
        </div>
      </ContentSection>

      {/* Our Solution */}
      <ContentSection variant="gray">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('about.solution.title')}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('about.solution.description')}
          </p>
        </div>
      </ContentSection>

      {/* Mission */}
      <ContentSection variant="gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('about.mission.title')}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {t('about.mission.description')}
          </p>
        </div>
      </ContentSection>

      {/* Values */}
      <ContentSection title={t('about.values.title')} variant="default">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Stats */}
      <ContentSection variant="gray">
        <StatsSection stats={stats} />
      </ContentSection>

      {/* CTA */}
      <CTASection
        title={t('about.cta.title')}
        subtitle={t('about.cta.subtitle')}
        primaryButton={{
          text: t('about.cta.customer'),
          href: `/${locale}/create-task`,
        }}
        secondaryButton={{
          text: t('about.cta.professional'),
          href: `/${locale}/for-professionals`,
        }}
      />
    </>
  )
}
