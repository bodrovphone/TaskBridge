import { Metadata } from 'next'
import { ForgotPasswordContent } from './forgot-password-content'

interface ForgotPasswordPageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Forgot Password | Trudify',
    description: 'Reset your Trudify account password',
  }
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { lang } = await params
  return <ForgotPasswordContent lang={lang} />
}
