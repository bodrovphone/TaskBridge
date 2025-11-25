import { Metadata } from 'next'
import { TermsPageContent } from './terms-page-content'

interface TermsPageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    bg: 'Общи условия | Trudify',
    en: 'Terms of Service | Trudify',
    ru: 'Условия использования | Trudify',
  }

  const descriptions: Record<string, string> = {
    bg: 'Прочетете общите условия за използване на платформата Trudify за услуги в България.',
    en: 'Read the terms and conditions for using the Trudify freelance platform in Bulgaria.',
    ru: 'Ознакомьтесь с условиями использования платформы Trudify для услуг в Болгарии.',
  }

  return {
    title: titles[lang] || titles.bg,
    description: descriptions[lang] || descriptions.bg,
    robots: 'index, follow',
    alternates: {
      canonical: `https://trudify.com/${lang}/terms`,
      languages: {
        'bg': '/bg/terms',
        'en': '/en/terms',
        'ru': '/ru/terms',
      },
    },
  }
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang } = await params
  return <TermsPageContent lang={lang} />
}
