import { MetadataRoute } from 'next'

/**
 * Dynamic robots.txt generation
 *
 * IMPORTANT: Set ALLOW_INDEXING=true in environment variables when ready for production
 * This prevents search engines from indexing staging/preview deployments
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'
  const allowIndexing = process.env.ALLOW_INDEXING === 'true'

  // Block all crawlers until production is ready
  if (!allowIndexing) {
    return {
      rules: {
        userAgent: '*',
        disallow: ['/'],
      },
    }
  }

  // Production configuration - allow indexing
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes
          '/auth/',          // Auth callbacks
          '/profile/',       // Private user profiles
          '/*?*',            // URL parameters (prevent duplicate content)
        ],
      },
      {
        // Allow specific query parameters for filtering (important for SEO)
        userAgent: '*',
        allow: [
          '/*/browse-tasks?category=*',
          '/*/browse-tasks?city=*',
          '/*/professionals?category=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
