import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { Button } from '@nextui-org/react'
import { ArrowRight, Clock, Shield, MessageSquare, Star } from 'lucide-react'
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

interface ForCustomersPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ForCustomersPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('for-customers', locale, '/for-customers')
}

export default async function ForCustomersPage({ params }: ForCustomersPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: t('forCustomers.benefits.fast'),
      description: t('forCustomers.benefits.fastDesc'),
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: t('forCustomers.benefits.verified'),
      description: t('forCustomers.benefits.verifiedDesc'),
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: t('forCustomers.benefits.communicate'),
      description: t('forCustomers.benefits.communicateDesc'),
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: t('forCustomers.benefits.reviews'),
      description: t('forCustomers.benefits.reviewsDesc'),
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
          { name: t('forCustomers.hero.title'), url: `/${locale}/for-customers` },
        ]}
      />
      <VideoListJsonLd
        videos={[
          {
            name: t('forCustomers.videoGuides.video1.title'),
            description: t('forCustomers.videoGuides.video1.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/njXl_ARz610/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/njXl_ARz610',
            embedUrl: 'https://www.youtube-nocookie.com/embed/njXl_ARz610',
            uploadDate: '2024-12-01',
            duration: 'PT1M',
          },
          {
            name: t('forCustomers.videoGuides.video2.title'),
            description: t('forCustomers.videoGuides.video2.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/KKSOJl-17hE/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/KKSOJl-17hE',
            embedUrl: 'https://www.youtube-nocookie.com/embed/KKSOJl-17hE',
            uploadDate: '2024-12-01',
            duration: 'PT1M',
          },
          {
            name: t('forCustomers.videoGuides.video3.title'),
            description: t('forCustomers.videoGuides.video3.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/TEt-4mU2Rds/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/TEt-4mU2Rds',
            embedUrl: 'https://www.youtube-nocookie.com/embed/TEt-4mU2Rds',
            uploadDate: '2024-12-01',
            duration: 'PT1M',
          },
          {
            name: t('forCustomers.videoGuides.video4.title'),
            description: t('forCustomers.videoGuides.video4.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/E_IdaJ1Ehv8/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/E_IdaJ1Ehv8',
            embedUrl: 'https://www.youtube-nocookie.com/embed/E_IdaJ1Ehv8',
            uploadDate: '2024-12-01',
            duration: 'PT1M',
          },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('forCustomers.hero.title')}
        subtitle={t('forCustomers.hero.subtitle')}
      >
        <Button
          as={Link}
          href={`/${locale}/create-task`}
          size="lg"
          className="bg-blue-600 text-white font-semibold hover:bg-blue-700"
          endContent={<ArrowRight className="w-5 h-5" />}
        >
          {t('forCustomers.hero.cta')}
        </Button>
      </ContentPageHero>

      {/* Benefits */}
      <ContentSection title={t('forCustomers.benefits.title')} variant="default">
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

      {/* How It Works */}
      <ContentSection variant="gray">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('forCustomers.howItWorks.title')}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('forCustomers.howItWorks.description')}
          </p>
        </div>
      </ContentSection>

      {/* Video Guides */}
      <ContentSection
        id="video-guides"
        title={t('forCustomers.videoGuides.title')}
        subtitle={t('forCustomers.videoGuides.subtitle')}
        variant="default"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Video 1: Registration & First Task */}
          <div className="text-center">
            <div className="relative mx-auto w-full max-w-[220px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/njXl_ARz610"
                title={t('forCustomers.videoGuides.video1.title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              {t('forCustomers.videoGuides.video1.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.videoGuides.video1.description')}
            </p>
          </div>

          {/* Video 2: Invite Professional */}
          <div className="text-center">
            <div className="relative mx-auto w-full max-w-[220px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/KKSOJl-17hE"
                title={t('forCustomers.videoGuides.video2.title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              {t('forCustomers.videoGuides.video2.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.videoGuides.video2.description')}
            </p>
          </div>

          {/* Video 3: Review Applications */}
          <div className="text-center">
            <div className="relative mx-auto w-full max-w-[220px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/TEt-4mU2Rds"
                title={t('forCustomers.videoGuides.video3.title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              {t('forCustomers.videoGuides.video3.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.videoGuides.video3.description')}
            </p>
          </div>

          {/* Video 4: Leave Review */}
          <div className="text-center">
            <div className="relative mx-auto w-full max-w-[220px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/E_IdaJ1Ehv8"
                title={t('forCustomers.videoGuides.video4.title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              {t('forCustomers.videoGuides.video4.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.videoGuides.video4.description')}
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Stats */}
      <ContentSection title={t('forCustomers.stats.title')} variant="default">
        <StatsSection stats={stats} />
      </ContentSection>

      {/* CTA */}
      <CTASection
        title={t('forCustomers.cta.title')}
        subtitle={t('forCustomers.cta.subtitle')}
        primaryButton={{
          text: t('forCustomers.cta.button'),
          href: `/${locale}/create-task`,
        }}
      />
    </>
  )
}
