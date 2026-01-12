const createNextIntlPlugin = require('next-intl/plugin');

// Create next-intl plugin with custom request config path
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    // Enable barrel file optimization for better tree-shaking
    optimizePackageImports: ['@heroui/react', 'lucide-react', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nyleceedixybtogrwilv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig);
