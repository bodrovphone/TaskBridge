import { Metadata } from 'next'
import { BrowseTasksPage as BrowseTasksComponent } from '@/features/browse-tasks'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'

interface BrowseTasksPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: BrowseTasksPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('browse-tasks', locale, '/browse-tasks')
}

function BrowseTasksPage() {
  return <BrowseTasksComponent />
}

BrowseTasksPage.displayName = 'BrowseTasksPage'

export default BrowseTasksPage