import { Metadata } from 'next'
import { Suspense } from 'react'
import { EmailVerifiedContent } from './email-verified-content'

// Skip static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

interface EmailVerifiedPageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Email Verified | Trudify',
    description: 'Your email has been successfully verified',
  }
}

function EmailVerifiedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      </div>
    </div>
  )
}

export default async function EmailVerifiedPage({ params }: EmailVerifiedPageProps) {
  const { lang } = await params
  return (
    <Suspense fallback={<EmailVerifiedLoading />}>
      <EmailVerifiedContent lang={lang} />
    </Suspense>
  )
}
