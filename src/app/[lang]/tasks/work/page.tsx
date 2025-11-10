import { MyWorkContent } from './components/my-work-content'

export default async function MyWorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MyWorkContent lang={lang} />
}
