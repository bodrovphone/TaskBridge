import { Metadata } from 'next'
import { EmailVerifiedContent } from './email-verified-content'

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

export default async function EmailVerifiedPage({ params }: EmailVerifiedPageProps) {
  const { lang } = await params
  return <EmailVerifiedContent lang={lang} />
}
