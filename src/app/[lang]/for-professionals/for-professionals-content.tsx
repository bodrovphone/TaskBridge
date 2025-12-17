'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { ArrowRight, DollarSign, Users, Star, Smartphone } from 'lucide-react'
import Link from 'next/link'
import {
  ContentPageHero,
  ContentSection,
  StatsSection,
  CTASection,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export default function ForProfessionalsContent() {
  const t = useTranslations()
  const params = useParams()
  const lang = params?.lang as string || 'bg'

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
          { name: 'Trudify', url: `/${lang}` },
          { name: t('forProfessionals.hero.title'), url: `/${lang}/for-professionals` },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('forProfessionals.hero.title')}
        subtitle={t('forProfessionals.hero.subtitle')}
      >
        <Button
          as={Link}
          href={`/${lang}/profile/professional`}
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
          href: `/${lang}/profile/professional`,
        }}
      />
    </>
  )
}
