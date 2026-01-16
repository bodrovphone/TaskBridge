import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { ArrowRight, DollarSign, Users, Star, Smartphone, FileText, ChevronDown, Bell, Search, Wallet } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import {
  ContentPageHero,
  ContentSection,
  StatsSection,
  CTASection,
  HowItWorksSection,
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
    { value: '10+', label: t('forProfessionals.stats.activeTasks') },
    { value: '10+', label: t('forProfessionals.stats.completedTasks') },
    { value: '8', label: t('about.stats.cities') },
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
            uploadDate: '2025-12-01T00:00:00+02:00',
            duration: 'PT1M',
          },
          {
            name: t('forProfessionals.videoGuides.video2.title'),
            description: t('forProfessionals.videoGuides.video2.description'),
            thumbnailUrl: 'https://i.ytimg.com/vi/u5PXMrdE9OQ/maxresdefault.jpg',
            contentUrl: 'https://www.youtube.com/shorts/u5PXMrdE9OQ',
            embedUrl: 'https://www.youtube-nocookie.com/embed/u5PXMrdE9OQ',
            uploadDate: '2025-12-01T00:00:00+02:00',
            duration: 'PT1M',
          },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('forProfessionals.hero.title')}
        subtitle={t('forProfessionals.hero.subtitle')}
      >
        <ButtonLink
          href={`/${locale}/profile/professional`}
          size="lg"
          endContent={<ArrowRight className="w-5 h-5" />}
        >
          {t('forProfessionals.hero.cta')}
        </ButtonLink>
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

      {/* How It Works - 4 Steps */}
      <HowItWorksSection
        title={t('forProfessionals.howItWorks.title')}
        subtitle={t('forProfessionals.howItWorks.subtitle')}
        colorPreset="professionals"
        steps={[
          {
            number: '01',
            title: t('forProfessionals.howItWorks.step1.title'),
            description: t('forProfessionals.howItWorks.step1.description'),
            badge: `2 ${t('common.minutes')}`,
            icon: FileText,
          },
          {
            number: '02',
            title: t('forProfessionals.howItWorks.step2.title'),
            description: t('forProfessionals.howItWorks.step2.description'),
            badge: t('forProfessionals.howItWorks.step2.badge'),
            icon: Bell,
          },
          {
            number: '03',
            title: t('forProfessionals.howItWorks.step3.title'),
            description: t('forProfessionals.howItWorks.step3.description'),
            badge: t('forProfessionals.howItWorks.step3.badge'),
            icon: Search,
          },
          {
            number: '04',
            title: t('forProfessionals.howItWorks.step4.title'),
            description: t('forProfessionals.howItWorks.step4.description'),
            badge: t('forProfessionals.howItWorks.step4.badge'),
            icon: Wallet,
          },
        ]}
      />

      {/* How Earnings Work */}
      <ContentSection variant="default">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('forProfessionals.howEarnings.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('forProfessionals.howEarnings.description')}
          </p>
          <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <p className="text-2xl font-bold text-green-700 mb-1">
              {t('forProfessionals.howEarnings.free')}
            </p>
            <p className="text-green-600">
              {t('forProfessionals.howEarnings.freeDesc')}
            </p>
          </div>
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

      {/* FAQ */}
      <ContentSection title={t('forProfessionals.faq.title')} variant="gray">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((num) => (
            <details
              key={num}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                <span className="font-medium text-gray-900">
                  {t(`forProfessionals.faq.q${num}`)}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-600">
                {t(`forProfessionals.faq.a${num}`)}
              </div>
            </details>
          ))}
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
