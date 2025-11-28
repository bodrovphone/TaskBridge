import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
 title: 'Trudify - Намерете проверени професионалисти',
 description: 'Свържете се с проверени местни професионалисти за всякакви задачи - от домашни ремонти до доставки и лична помощ. Сигурна платформа с проверени специалисти.',
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
   <body className={`${inter.className} overflow-x-hidden w-full`}>
    {children}
    <Analytics />
    <SpeedInsights />
   </body>
  </html>
 )
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;