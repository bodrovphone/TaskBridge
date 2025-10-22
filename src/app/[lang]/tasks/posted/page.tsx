import { PostedTasksPageContent } from './components/posted-tasks-page-content'

interface PostedTasksPageProps {
  params: {
    lang: string
  }
}

export default function PostedTasksPage({ params }: PostedTasksPageProps) {
  return <PostedTasksPageContent lang={params.lang} />
}
