import { Metadata } from 'next'
import { PrivacyPageContent } from './privacy-page-content'

interface PrivacyPageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    bg: 'Политика за поверителност | Trudify',
    en: 'Privacy Policy | Trudify',
    ru: 'Политика конфиденциальности | Trudify',
  }

  const descriptions: Record<string, string> = {
    bg: 'Научете как Trudify събира, използва и защитава вашите лични данни съгласно GDPR.',
    en: 'Learn how Trudify collects, uses, and protects your personal data in compliance with GDPR.',
    ru: 'Узнайте, как Trudify собирает, использует и защищает ваши персональные данные в соответствии с GDPR.',
  }

  return {
    title: titles[lang] || titles.bg,
    description: descriptions[lang] || descriptions.bg,
    robots: 'index, follow',
    alternates: {
      canonical: `https://trudify.com/${lang}/privacy`,
      languages: {
        'bg': '/bg/privacy',
        'en': '/en/privacy',
        'ru': '/ru/privacy',
      },
    },
  }
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params
  return <PrivacyPageContent lang={lang} />
}
