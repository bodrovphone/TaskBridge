import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

// Primary font - Plovdiv Typeface (Bulgarian font with Cyrillic support)
// Loaded via @font-face in globals.css

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

export const metadata: Metadata = {
 metadataBase: new URL(baseUrl),
 title: {
  default: 'Trudify - Намерете проверени професионалисти',
  template: '%s | Trudify',
 },
 description: 'Свържете се с проверени местни професионалисти за всякакви задачи - от домашни ремонти до доставки и лична помощ. Сигурна платформа с проверени специалисти.',
 keywords: ['професионалисти', 'услуги', 'майстори', 'България', 'freelance', 'handyman'],
 authors: [{ name: 'Trudify' }],
 creator: 'Trudify',
 publisher: 'Trudify',
 robots: {
  index: process.env.ALLOW_INDEXING === 'true',
  follow: process.env.ALLOW_INDEXING === 'true',
 },
 icons: {
  icon: [
   { url: '/images/logo/trudify-logo-32.png', sizes: '32x32', type: 'image/png' },
  ],
  apple: [
   { url: '/images/logo/trudify-logo-180.png', sizes: '180x180', type: 'image/png' },
  ],
  other: [
   { rel: 'icon', url: '/images/logo/trudify-logo-192.png', sizes: '192x192', type: 'image/png' },
   { rel: 'icon', url: '/images/logo/trudify-logo-512.png', sizes: '512x512', type: 'image/png' },
  ],
 },
 manifest: '/manifest.json',
 openGraph: {
  type: 'website',
  locale: 'bg_BG',
  alternateLocale: ['en_US', 'ru_RU'],
  url: baseUrl,
  siteName: 'Trudify',
  title: 'Trudify - Намерете проверени професионалисти',
  description: 'Свържете се с проверени местни професионалисти за всякакви задачи.',
  // Image auto-generated from /app/opengraph-image.tsx
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Trudify - Намерете проверени професионалисти',
  description: 'Свържете се с проверени местни професионалисти за всякакви задачи.',
  // Image auto-generated from /app/opengraph-image.tsx
 },
 // Google Search Console verification - set via environment variable
 verification: {
  google: process.env.GOOGLE_SITE_VERIFICATION,
 },
}

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
 maximumScale: 5,
 userScalable: true,
}

function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
  <html lang="bg" className="overflow-x-hidden">
   <body className="font-sans overflow-x-hidden w-full">
    {children}
    <Analytics />
    <SpeedInsights />
   </body>
  </html>
 )
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;