import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import AboutContent from './about-content'

interface AboutPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('about', locale, '/about')
}

export default function AboutPage() {
  return <AboutContent />
}
