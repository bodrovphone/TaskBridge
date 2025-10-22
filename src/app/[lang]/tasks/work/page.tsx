import { MyWorkContent } from './components/my-work-content'

export default function MyWorkPage({ params }: { params: { lang: string } }) {
  return <MyWorkContent lang={params.lang} />
}
