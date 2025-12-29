import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { getAllArticleSlugs } from '@/features/blog'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

/**
 * Dynamic sitemap generation for SEO
 * Includes all public pages in all supported locales (en, bg, ru)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = generateStaticUrls()
  const blogUrls = generateBlogUrls()
  const dynamicUrls = await generateDynamicUrls()

  return [...staticUrls, ...blogUrls, ...dynamicUrls]
}

/**
 * Generate URLs for static pages
 */
function generateStaticUrls(): MetadataRoute.Sitemap {
  // Public static pages with their priorities
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/browse-tasks', priority: 0.9, changeFrequency: 'hourly' as const },
    { path: '/professionals', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/create-task', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/categories', priority: 0.7, changeFrequency: 'weekly' as const },
    // Content/Marketing pages
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/for-professionals', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/for-customers', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/testimonials', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/giveaway', priority: 0.8, changeFrequency: 'weekly' as const },
    // Legal pages
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  return staticPages.flatMap((page) =>
    SUPPORTED_LOCALES.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  )
}

/**
 * Generate URLs for article pages (at root level, no /blog/ prefix)
 */
function generateBlogUrls(): MetadataRoute.Sitemap {
  const articleSlugs = getAllArticleSlugs()

  return articleSlugs.map(({ slug, locale }) => ({
    url: `${baseUrl}/${locale}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
}

/**
 * Generate URLs for dynamic pages (tasks, professionals)
 */
async function generateDynamicUrls(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = []

  try {
    const supabase = createAdminClient()

    // Fetch public tasks (open or in_progress status)
    // Include slug for SEO-friendly URLs
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, slug, updated_at')
      .in('status', ['open', 'in_progress'])
      .order('updated_at', { ascending: false })
      .limit(1000) // Limit for performance

    if (tasks) {
      tasks.forEach((task) => {
        // Use slug for SEO-friendly URLs, fallback to id for legacy tasks
        const identifier = task.slug || task.id
        SUPPORTED_LOCALES.forEach((locale) => {
          urls.push({
            url: `${baseUrl}/${locale}/tasks/${identifier}`,
            lastModified: new Date(task.updated_at),
            changeFrequency: 'daily',
            priority: 0.7,
          })
        })
      })
    }

    // Fetch public professional profiles (users with professional_title)
    // Include slug for SEO-friendly URLs
    const { data: professionals } = await supabase
      .from('users')
      .select('id, slug, updated_at')
      .not('professional_title', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1000) // Limit for performance

    if (professionals) {
      professionals.forEach((professional) => {
        // Use slug for SEO-friendly URLs, fallback to id for legacy profiles
        const identifier = professional.slug || professional.id
        SUPPORTED_LOCALES.forEach((locale) => {
          urls.push({
            url: `${baseUrl}/${locale}/professionals/${identifier}`,
            lastModified: new Date(professional.updated_at),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        })
      })
    }
  } catch (error) {
    // Log error but don't fail sitemap generation
    console.error('Error generating dynamic sitemap URLs:', error)
  }

  return urls
}
