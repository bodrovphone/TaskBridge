/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['replit.com'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEXTAUTH_SECRET: process.env.SESSION_SECRET,
    NEXTAUTH_URL: process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:3000',
    REPL_ID: process.env.REPL_ID,
    ISSUER_URL: process.env.ISSUER_URL || 'https://replit.com/oidc',
    REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
  }
}

export default nextConfig