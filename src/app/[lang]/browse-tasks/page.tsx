import { Suspense } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BrowseTasksPage as BrowseTasksComponent } from '@/features/browse-tasks'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { validateLocale } from '@/lib/utils/locale-detection'
import { SupportedLocale } from '@/lib/constants/locales'
import { TaskService } from '@/server/tasks/task.service'
import type { Task } from '@/server/tasks/task.types'

/**
 * ISR Configuration - Incremental Static Regeneration
 * Featured tasks don't change frequently, so we cache for 1 hour
 * This provides instant page loads while keeping data reasonably fresh
 */
export const revalidate = 3600 // 1 hour

interface BrowseTasksPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: BrowseTasksPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  return generatePageMetadata('browse-tasks', locale, '/browse-tasks')
}

/**
 * Server-side data fetching for featured tasks
 * This runs at build time and on revalidation (every hour)
 */
async function getFeaturedTasks() {
  try {
    const taskService = new TaskService()
    const result = await taskService.getFeaturedTasks()

    if (!result.success) {
      console.error('[BrowseTasksPage SSR] Failed to fetch featured tasks:', result.error)
      return []
    }

    return result.data
  } catch (error) {
    console.error('[BrowseTasksPage SSR] Error fetching featured tasks:', error)
    return []
  }
}

/**
 * Server-rendered SEO content - visible to search engines in HTML source
 * Uses sr-only to hide from visual users while keeping content crawlable
 */
async function SEOTasksContent({ tasks, locale }: { tasks: Task[], locale: string }) {
  const t = await getTranslations({ locale })

  // Helper to get localized task content
  const getLocalizedTitle = (task: Task) => {
    if (locale === 'bg' && task.title_bg) return task.title_bg
    return task.title
  }
  const getLocalizedDescription = (task: Task) => {
    if (locale === 'bg' && task.description_bg) return task.description_bg
    return task.description
  }

  return (
    <div className="sr-only" aria-hidden="false">
      <h1>{t('browseTasks.hero.title1')} {t('browseTasks.hero.title2')}</h1>
      <p>{t('browseTasks.hero.subtitle')}</p>

      <h2>{t('browseTasks.results.featuredTasks')}</h2>
      <ul>
        {tasks.slice(0, 10).map((task) => (
          <li key={task.id}>
            <article>
              <h3>{getLocalizedTitle(task)}</h3>
              <p>{getLocalizedDescription(task)}</p>
              <dl>
                <dt>{t('task.location')}</dt>
                <dd>{task.city}{task.neighborhood ? `, ${task.neighborhood}` : ''}</dd>
                <dt>{t('task.budget')}</dt>
                <dd>
                  {task.budget_min_bgn && task.budget_max_bgn
                    ? `${task.budget_min_bgn}-${task.budget_max_bgn} €`
                    : task.budget_max_bgn
                    ? `${task.budget_max_bgn} €`
                    : t('taskCard.budget.negotiable')}
                </dd>
                <dt>{t('task.category')}</dt>
                <dd>{task.category}{task.subcategory ? ` - ${task.subcategory}` : ''}</dd>
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function BrowseTasksPage({ params }: BrowseTasksPageProps) {
  const { lang } = await params

  // Fetch featured tasks on the server
  const initialFeaturedTasks = await getFeaturedTasks()

  return (
    <>
      {/* SEO content - crawlable by search engines */}
      <SEOTasksContent tasks={initialFeaturedTasks} locale={lang} />

      {/* Interactive client component - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <BrowseTasksComponent initialFeaturedTasks={initialFeaturedTasks} />
      </Suspense>
    </>
  )
}
