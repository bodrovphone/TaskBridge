import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { FileText, MessageSquare, UserCheck, Star, Search, Send, TrendingUp, Briefcase } from 'lucide-react'
import {
  ContentPageHero,
  ContentSection,
  ProcessSteps,
  CTASection,
} from '@/components/content'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

// Static generation for all locales
export const dynamic = 'force-static'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

interface HowItWorksPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('how-it-works', locale, '/how-it-works')
}

export default async function HowItWorksPage({ params }: HowItWorksPageProps) {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const t = await getTranslations({ locale })

  const customerSteps = [
    {
      title: t('howItWorks.customers.step1.title'),
      description: t('howItWorks.customers.step1.description'),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t('howItWorks.customers.step2.title'),
      description: t('howItWorks.customers.step2.description'),
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      title: t('howItWorks.customers.step3.title'),
      description: t('howItWorks.customers.step3.description'),
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      title: t('howItWorks.customers.step4.title'),
      description: t('howItWorks.customers.step4.description'),
      icon: <Star className="w-6 h-6" />,
    },
  ]

  const professionalSteps = [
    {
      title: t('howItWorks.professionals.step1.title'),
      description: t('howItWorks.professionals.step1.description'),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      title: t('howItWorks.professionals.step2.title'),
      description: t('howItWorks.professionals.step2.description'),
      icon: <Search className="w-6 h-6" />,
    },
    {
      title: t('howItWorks.professionals.step3.title'),
      description: t('howItWorks.professionals.step3.description'),
      icon: <Send className="w-6 h-6" />,
    },
    {
      title: t('howItWorks.professionals.step4.title'),
      description: t('howItWorks.professionals.step4.description'),
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Trudify', url: `/${locale}` },
          { name: t('howItWorks.hero.title'), url: `/${locale}/how-it-works` },
        ]}
      />

      {/* Hero */}
      <ContentPageHero
        title={t('howItWorks.hero.title')}
        subtitle={t('howItWorks.hero.subtitle')}
      />

      {/* For Customers */}
      <ContentSection
        title={t('howItWorks.customers.title')}
        subtitle={t('howItWorks.customers.subtitle')}
        variant="default"
      >
        <div className="max-w-2xl mx-auto">
          <ProcessSteps steps={customerSteps} />
        </div>
      </ContentSection>

      {/* For Professionals */}
      <ContentSection
        title={t('howItWorks.professionals.title')}
        subtitle={t('howItWorks.professionals.subtitle')}
        variant="gray"
      >
        <div className="max-w-2xl mx-auto">
          <ProcessSteps steps={professionalSteps} />
        </div>
      </ContentSection>

      {/* CTA */}
      <CTASection
        title={t('howItWorks.cta.title')}
        subtitle={t('howItWorks.cta.subtitle')}
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
