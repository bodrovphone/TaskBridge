import { Metadata } from 'next'
import { ResetPasswordContent } from './reset-password-content'

interface ResetPasswordPageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reset Password | Trudify',
    description: 'Set a new password for your Trudify account',
  }
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { lang } = await params
  return <ResetPasswordContent lang={lang} />
}
