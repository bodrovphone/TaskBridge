import { redirect } from 'next/navigation'

// This page should never be reached due to middleware redirects,
// but provides a fallback just in case
export default function RootPage() {
  // Redirect to default locale
  redirect('/en')
}