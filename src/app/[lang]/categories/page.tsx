import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import CategoriesContent from './categories-content'

interface CategoriesPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('categories', locale, '/categories')
}

export default function CategoriesPage() {
  return <CategoriesContent />
}
