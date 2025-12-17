import { PostedTasksPageContent } from './components/posted-tasks-page-content'

// Skip static generation for authenticated pages
export const dynamic = 'force-dynamic'

interface PostedTasksPageProps {
  params: Promise<{
    lang: string
  }>
}

export default async function PostedTasksPage({ params }: PostedTasksPageProps) {
  const { lang } = await params
  return <PostedTasksPageContent lang={lang} />
}
