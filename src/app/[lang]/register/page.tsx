import { Metadata } from 'next'
import { RegisterPageContent } from './components/register-page-content'

export const dynamic = 'force-dynamic'

interface RegisterPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    intent?: 'professional' | 'customer'
    source?: string
    title?: string
    categories?: string
    city?: string
  }>
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    en: 'Join Trudify - Bulgaria\'s #1 Freelance Platform',
    bg: 'Присъединете се към Trudify - #1 платформа за услуги в България',
    ru: 'Присоединяйтесь к Trudify - #1 платформа услуг в Болгарии',
  }

  const descriptions: Record<string, string> = {
    en: 'Create your free account and connect with verified professionals or start earning by offering your services.',
    bg: 'Създайте безплатен акаунт и се свържете с проверени професионалисти или започнете да печелите, като предлагате услугите си.',
    ru: 'Создайте бесплатный аккаунт и свяжитесь с проверенными профессионалами или начните зарабатывать, предлагая свои услуги.',
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    robots: { index: true, follow: true },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      type: 'website',
    },
  }
}

export default async function RegisterPage({ params, searchParams }: RegisterPageProps) {
  const { lang } = await params
  const { intent, source, title, categories, city } = await searchParams

  // Build initial professional data from URL params (read once on server)
  const initialProfessionalData = (title || categories || city) ? {
    professionalTitle: title || '',
    serviceCategories: categories ? categories.split(',').filter(Boolean) : [],
    city: city || '',
  } : undefined

  return (
    <RegisterPageContent
      lang={lang}
      initialIntent={intent}
      source={source}
      initialProfessionalData={initialProfessionalData}
    />
  )
}
