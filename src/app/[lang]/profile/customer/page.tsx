import { Metadata } from 'next'
import { CustomerProfilePageContent } from './components/customer-profile-page-content'

interface CustomerProfilePageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: CustomerProfilePageProps): Promise<Metadata> {
  return {
    title: 'Customer Profile | Trudify',
    description: 'Manage your customer profile and posted tasks on Trudify',
  }
}

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  const { lang } = await params
  return <CustomerProfilePageContent lang={lang} />
}
