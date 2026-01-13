import { Metadata } from 'next'
import { ProfessionalProfilePageContent } from './components/professional-profile-page-content'

// Skip static generation for authenticated pages
export const dynamic = 'force-dynamic'

interface ProfessionalProfilePageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params: _params }: ProfessionalProfilePageProps): Promise<Metadata> {
  return {
    title: 'Professional Profile | Trudify',
    description: 'Manage your professional profile and services on Trudify',
  }
}

export default async function ProfessionalProfilePage({ params }: ProfessionalProfilePageProps) {
  const { lang } = await params
  return <ProfessionalProfilePageContent lang={lang} />
}
