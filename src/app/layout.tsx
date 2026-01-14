import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

// Primary font - Plovdiv Typeface (Bulgarian font with Cyrillic support)
// Using next/font/local for automatic preloading and optimal loading
const plovdivDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/PlovdivTypeface-Fonts/PlovdivDisplay-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PlovdivTypeface-Fonts/PlovdivDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PlovdivTypeface-Fonts/PlovdivDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-plovdiv',
  preload: true,
})

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

/**
 * Critical CSS for above-the-fold content
 * This inline CSS ensures fast initial render (improved LCP/FCP)
 * Contains only essential styles for: layout, header, hero section, fonts
 */
const criticalCSS = `
  :root{--background:0 0% 100%;--foreground:222.2 84% 4.9%;--primary:221.2 83.2% 53.3%;--primary-foreground:210 40% 98%}
  *,::after,::before{box-sizing:border-box;border-width:0;border-style:solid}
  html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif}
  body{margin:0;line-height:inherit;-webkit-font-smoothing:antialiased}
  .min-h-screen{min-height:100vh}
  .flex{display:flex}
  .flex-col{flex-direction:column}
  .flex-1{flex:1 1 0%}
  .overflow-x-hidden{overflow-x:hidden}
  .w-full{width:100%}
  .max-w-full{max-width:100%}
  .relative{position:relative}
  .absolute{position:absolute}
  .fixed{position:fixed}
  .inset-0{inset:0}
  .z-10{z-index:10}
  .h-20{height:5rem}
  .hidden{display:none}
  @media(min-width:1024px){.lg\\:block{display:block}.lg\\:hidden{display:none}}
  .bg-white{background-color:#fff}
  .text-slate-900{color:rgb(15 23 42)}
  .font-bold{font-weight:700}
  .text-\\[2\\.5rem\\]{font-size:2.5rem}
  .leading-\\[1\\.1\\]{line-height:1.1}
  .px-4{padding-left:1rem;padding-right:1rem}
  .py-6{padding-top:1.5rem;padding-bottom:1.5rem}
  .mx-auto{margin-left:auto;margin-right:auto}
  .max-w-7xl{max-width:80rem}
  .grid{display:grid}
  .gap-8{gap:2rem}
  .items-center{align-items:center}
  .space-y-6>:not([hidden])~:not([hidden]){margin-top:1.5rem}
  .rounded-xl{border-radius:0.75rem}
  .shadow-xl{box-shadow:0 20px 25px -5px rgb(0 0 0/0.1)}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
`;

function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
  <html lang="bg" className={`overflow-x-hidden ${plovdivDisplay.variable}`}>
   <head>
    {/* Inline critical CSS for fast initial render */}
    <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
   </head>
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