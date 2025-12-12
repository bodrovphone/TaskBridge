import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import TestimonialsContent from './testimonials-content'

interface TestimonialsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: TestimonialsPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('testimonials', locale, '/testimonials')
}

export default function TestimonialsPage() {
  return <TestimonialsContent />
}
