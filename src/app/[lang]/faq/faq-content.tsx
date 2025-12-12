'use client'

import { useTranslation } from 'react-i18next'
import { useParams } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import {
  ContentPageHero,
  ContentSection,
  FAQAccordion,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export default function FAQContent() {
  const { t } = useTranslation()
  const params = useParams()
  const lang = params?.lang as string || 'bg'

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

  // Combine all FAQs for schema (only include once)
  const allFAQs = [...customerFAQs, ...professionalFAQs, ...generalFAQs]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${lang}` },
          { name: t('faq.hero.title'), url: `/${lang}/faq` },
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
