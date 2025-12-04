import { Metadata } from 'next'
import { DeleteAccountContent } from './delete-account-content'

interface DeleteAccountPageProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Delete Account | Trudify',
    description: 'Permanently delete your Trudify account and all associated data',
  }
}

export default async function DeleteAccountPage({ params }: DeleteAccountPageProps) {
  const { lang } = await params
  return <DeleteAccountContent lang={lang} />
}
