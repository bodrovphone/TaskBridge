import { ApplicationsPageContent } from './components/applications-page-content'

interface ApplicationsPageProps {
  params: Promise<{
    lang: string
  }>
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const { lang } = await params
  return <ApplicationsPageContent lang={lang} />
}
