import { ApplicationsPageContent } from './components/applications-page-content'

interface ApplicationsPageProps {
  params: {
    lang: string
  }
}

export default function ApplicationsPage({ params }: ApplicationsPageProps) {
  return <ApplicationsPageContent lang={params.lang} />
}
