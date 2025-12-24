import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { Button } from '@nextui-org/react'
import { Mail, PlayCircle, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { LocaleLink } from '@/components/common/locale-link'
import {
  ContentPageHero,
  ContentSection,
  FAQAccordion,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface FAQPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: FAQPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('faq', locale, '/faq')
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const customerFAQs = [
    { question: t('faq.customers.q1'), answer: t('faq.customers.a1') },
    { question: t('faq.customers.q2'), answer: t('faq.customers.a2') },
    { question: t('faq.customers.q3'), answer: t('faq.customers.a3') },
    { question: t('faq.customers.q4'), answer: t('faq.customers.a4') },
    { question: t('faq.customers.q5'), answer: t('faq.customers.a5') },
  ]

  const professionalFAQs = [
    { question: t('faq.professionals.q1'), answer: t('faq.professionals.a1') },
    { question: t('faq.professionals.q2'), answer: t('faq.professionals.a2') },
    { question: t('faq.professionals.q3'), answer: t('faq.professionals.a3') },
    { question: t('faq.professionals.q4'), answer: t('faq.professionals.a4') },
    { question: t('faq.professionals.q5'), answer: t('faq.professionals.a5') },
  ]

  const generalFAQs = [
    { question: t('faq.general.q1'), answer: t('faq.general.a1') },
    { question: t('faq.general.q2'), answer: t('faq.general.a2') },
    { question: t('faq.general.q3'), answer: t('faq.general.a3') },
    { question: t('faq.general.q4'), answer: t('faq.general.a4') },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${locale}` },
          { name: t('faq.hero.title'), url: `/${locale}/faq` },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('faq.hero.title')}
        subtitle={t('faq.hero.subtitle')}
      />

      {/* Customer FAQs */}
      <ContentSection title={t('faq.customers.title')} variant="default">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion faqs={customerFAQs} includeSchema={false} />
        </div>
      </ContentSection>

      {/* Professional FAQs */}
      <ContentSection title={t('faq.professionals.title')} variant="gray">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion faqs={professionalFAQs} includeSchema={false} />
        </div>
      </ContentSection>

      {/* General FAQs */}
      <ContentSection title={t('faq.general.title')} variant="default">
        <div className="max-w-3xl mx-auto">
          {/* Include schema only once with all FAQs */}
          <FAQAccordion faqs={generalFAQs} includeSchema={true} />
        </div>
      </ContentSection>

      {/* Helpful Resources */}
      <ContentSection title={t('faq.resources.title')} variant="gray">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Video Guide for Customers */}
            <LocaleLink
              href="/for-customers"
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <PlayCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {t('faq.resources.customerGuide')}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('faq.resources.customerGuideDesc')}
              </p>
              <span className="inline-flex items-center text-blue-600 text-sm font-medium">
                {t('faq.resources.watchVideos')}
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </LocaleLink>

            {/* Video Guide for Professionals */}
            <LocaleLink
              href="/for-professionals"
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-emerald-200"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                <PlayCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {t('faq.resources.professionalGuide')}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('faq.resources.professionalGuideDesc')}
              </p>
              <span className="inline-flex items-center text-emerald-600 text-sm font-medium">
                {t('faq.resources.watchVideos')}
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </LocaleLink>

            {/* Blog Post - only show for BG locale since article is in Bulgarian */}
            {locale === 'bg' && (
              <Link
                href="/bg/tarsya-rabota-v-bulgaria"
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-purple-200"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {t('faq.resources.blogPost')}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {t('faq.resources.blogPostDesc')}
                </p>
                <span className="inline-flex items-center text-purple-600 text-sm font-medium">
                  {t('faq.resources.readArticle')}
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </ContentSection>

      {/* CTA */}
      <ContentSection variant="gradient">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('faq.cta.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('faq.cta.subtitle')}
          </p>
          <Button
            as={Link}
            href="mailto:support@trudify.com"
            size="lg"
            className="bg-blue-600 text-white font-semibold hover:bg-blue-700"
            startContent={<Mail className="w-5 h-5" />}
          >
            {t('faq.cta.contact')}
          </Button>
        </div>
      </ContentSection>
    </>
  )
}
