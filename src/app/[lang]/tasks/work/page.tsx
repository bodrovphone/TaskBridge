import { MyWorkContent } from './components/my-work-content'

// Skip static generation for authenticated pages
export const dynamic = 'force-dynamic'

export default async function MyWorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MyWorkContent lang={lang} />
}
