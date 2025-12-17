import { Metadata } from 'next'
import { Suspense } from 'react'
import { CustomerProfilePageContent } from './components/customer-profile-page-content'

// Skip static generation for authenticated pages
export const dynamic = 'force-dynamic'

interface CustomerProfilePageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Customer Profile | Trudify',
    description: 'Manage your customer profile and posted tasks on Trudify',
  }
}

function CustomerProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  const { lang } = await params
  return (
    <Suspense fallback={<CustomerProfileLoading />}>
      <CustomerProfilePageContent lang={lang} />
    </Suspense>
  )
}
