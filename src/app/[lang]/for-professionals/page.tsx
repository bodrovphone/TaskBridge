import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { Button } from '@nextui-org/react'
import { ArrowRight, DollarSign, Users, Star, Smartphone } from 'lucide-react'
import Link from 'next/link'
import {
  ContentPageHero,
  ContentSection,
  StatsSection,
  CTASection,
} from '@/components/content'
import { BreadcrumbJsonLd, VideoListJsonLd } from '@/components/seo/json-ld'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface ForProfessionalsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ForProfessionalsPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('for-professionals', locale, '/for-professionals')
}

export default async function ForProfessionalsPage({ params }: ForProfessionalsPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: t('forProfessionals.benefits.noFees'),
      description: t('forProfessionals.benefits.noFeesDesc'),
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: t('forProfessionals.benefits.customers'),
      description: t('forProfessionals.benefits.customersDesc'),
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: t('forProfessionals.benefits.reputation'),
      description: t('forProfessionals.benefits.reputationDesc'),
    },
    {
      icon: <Smartphone className="w-8 h-8 text-purple-600" />,
      title: t('forProfessionals.benefits.mobile'),
      description: t('forProfessionals.benefits.mobileDesc'),
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
          { name: t('forProfessionals.hero.title'), url: `/${locale}/for-professionals` },
        ]}
      />
      <VideoListJsonLd
        videos={[
          {
            name: t('forProfessionals.videoGuides.video1.title'),
            description: t('forProfessionals.videoGuides.video1.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/CxX2YdOva60/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/CxX2YdOva60',
            embedUrl: 'https://www.youtube-nocookie.com/embed/CxX2YdOva60',
            uploadDate: '2024-12-01',
            duration: 'PT1M',
          },
          {
            name: t('forProfessionals.videoGuides.video2.title'),
            description: t('forProfessionals.videoGuides.video2.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/u5PXMrdE9OQ/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/u5PXMrdE9OQ',
            embedUrl: 'https://www.youtube-nocookie.com/embed/u5PXMrdE9OQ',
            uploadDate: '2024-12-01',
            duration: 'PT1M',
          },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('forProfessionals.hero.title')}
        subtitle={t('forProfessionals.hero.subtitle')}
      >
        <Button
          as={Link}
          href={`/${locale}/profile/professional`}
          size="lg"
          className="bg-blue-600 text-white font-semibold hover:bg-blue-700"
          endContent={<ArrowRight className="w-5 h-5" />}
        >
          {t('forProfessionals.hero.cta')}
        </Button>
      </ContentPageHero>

      {/* Benefits */}
      <ContentSection title={t('forProfessionals.benefits.title')} variant="default">
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* How Earnings Work */}
      <ContentSection variant="gray">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('forProfessionals.howEarnings.title')}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('forProfessionals.howEarnings.description')}
          </p>
        </div>
      </ContentSection>

      {/* Video Guides */}
      <ContentSection
        id="video-guides"
        title={t('forProfessionals.videoGuides.title')}
        subtitle={t('forProfessionals.videoGuides.subtitle')}
        variant="default"
      >
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Video 1: Getting Started */}
          <div className="text-center">
            <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/CxX2YdOva60"
                title={t('forProfessionals.videoGuides.video1.title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {t('forProfessionals.videoGuides.video1.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forProfessionals.videoGuides.video1.description')}
            </p>
          </div>

          {/* Video 2: Finding Work */}
          <div className="text-center">
            <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/u5PXMrdE9OQ"
                title={t('forProfessionals.videoGuides.video2.title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {t('forProfessionals.videoGuides.video2.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forProfessionals.videoGuides.video2.description')}
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Stats */}
      <ContentSection title={t('forProfessionals.stats.title')} variant="default">
        <StatsSection stats={stats} />
      </ContentSection>

      {/* CTA */}
      <CTASection
        title={t('forProfessionals.cta.title')}
        subtitle={t('forProfessionals.cta.subtitle')}
        primaryButton={{
          text: t('forProfessionals.cta.button'),
          href: `/${locale}/profile/professional`,
        }}
      />
    </>
  )
}
