import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import GiveawayContent from './giveaway-content'

interface GiveawayPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: GiveawayPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('giveaway', locale, '/giveaway')
}

export default function GiveawayPage() {
  return <GiveawayContent />
}
