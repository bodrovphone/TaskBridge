import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { Button } from '@nextui-org/react'
import { Mail } from 'lucide-react'
import Link from 'next/link'
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
