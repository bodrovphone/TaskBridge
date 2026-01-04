import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { Button } from '@nextui-org/react'
import { ArrowRight, Clock, Shield, MessageSquare, Star, FileText, Users, CheckCircle, Lock, ChevronDown } from 'lucide-react'
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

      {/* How It Works - 3 Steps */}
      <ContentSection
        title={t('forCustomers.howItWorks.title')}
        subtitle={t('forCustomers.howItWorks.subtitle')}
        variant="gray"
      >
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-600 mb-2">1</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('forCustomers.howItWorks.step1.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.howItWorks.step1.description')}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-600 mb-2">2</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('forCustomers.howItWorks.step2.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.howItWorks.step2.description')}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
              <CheckCircle className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-sm font-medium text-amber-600 mb-2">3</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('forCustomers.howItWorks.step3.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('forCustomers.howItWorks.step3.description')}
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Value Proposition */}
      <ContentSection variant="default">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('forCustomers.valueProposition.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('forCustomers.valueProposition.description')}
          </p>
          <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-2xl font-bold text-green-700 mb-1">
              {t('forCustomers.valueProposition.free')}
            </p>
            <p className="text-green-600">
              {t('forCustomers.valueProposition.freeDesc')}
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Privacy */}
      <ContentSection variant="gray">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <Lock className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            {t('forCustomers.privacy.title')}
          </h2>
          <p className="text-gray-600">
            {t('forCustomers.privacy.description')}
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

      {/* FAQ */}
      <ContentSection title={t('forCustomers.faq.title')} variant="gray">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((num) => (
            <details
              key={num}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                <span className="font-medium text-gray-900">
                  {t(`forCustomers.faq.q${num}`)}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-600">
                {t(`forCustomers.faq.a${num}`)}
              </div>
            </details>
          ))}
        </div>
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
