import { PostedTasksPageContent } from './components/posted-tasks-page-content'

interface PostedTasksPageProps {
  params: Promise<{
    lang: string
  }>
}

export default async function PostedTasksPage({ params }: PostedTasksPageProps) {
  const { lang } = await params
  return <PostedTasksPageContent lang={lang} />
}
