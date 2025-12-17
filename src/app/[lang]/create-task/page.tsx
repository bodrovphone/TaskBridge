import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import CreateTaskContent from './create-task-content'

// Skip static generation for authenticated pages
export const dynamic = 'force-dynamic'

interface CreateTaskPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: CreateTaskPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('create-task', locale, '/create-task')
}

export default function CreateTaskPage() {
  return <CreateTaskContent />
}
