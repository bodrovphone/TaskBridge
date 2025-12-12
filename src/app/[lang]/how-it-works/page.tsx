import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import HowItWorksContent from './how-it-works-content'

interface HowItWorksPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('how-it-works', locale, '/how-it-works')
}

export default function HowItWorksPage() {
  return <HowItWorksContent />
}
