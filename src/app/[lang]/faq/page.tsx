import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import FAQContent from './faq-content'

interface FAQPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: FAQPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('faq', locale, '/faq')
}

export default function FAQPage() {
  return <FAQContent />
}
