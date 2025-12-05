import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

// Primary font - Montserrat with Cyrillic support
const montserrat = Montserrat({
 subsets: ['latin', 'cyrillic'],
 variable: '--font-montserrat',
 weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
 title: 'Trudify - Намерете проверени професионалисти',
 description: 'Свържете се с проверени местни професионалисти за всякакви задачи - от домашни ремонти до доставки и лична помощ. Сигурна платформа с проверени специалисти.',
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
   <body className={`${montserrat.variable} font-sans overflow-x-hidden w-full`}>
    {children}
    <Analytics />
    <SpeedInsights />
   </body>
  </html>
 )
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;