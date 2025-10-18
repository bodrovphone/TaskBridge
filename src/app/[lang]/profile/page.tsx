import { Metadata } from 'next'
import { ProfilePageContent } from './components/profile-page-content'

interface ProfilePageProps {
 params: Promise<{
  lang: string
 }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
 return {
  title: 'Profile | Trudify',
  description: 'Manage your profile, settings, and services on Trudify',
 }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
 const { lang } = await params
 return <ProfilePageContent lang={lang} />
}