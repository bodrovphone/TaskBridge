import { createClient } from '@/lib/supabase/server'
import type { TaskStatus } from '@/lib/utils/task-permissions'

export interface FeaturedTask {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  budget_min: number
  budget_max: number
  budget_type: 'fixed' | 'hourly' | 'negotiable' | 'unclear'
  city: string
  neighborhood: string
  deadline: string
  urgency: 'same_day' | 'within_week' | 'flexible'
  requirements: string
  images: string[] // Database field name
  status: TaskStatus
  created_at: string
  applications_count?: number
}

/**
 * Calculate diversity score for a task
 * Higher score = more diverse/interesting for featured section
 *
 * Scoring criteria:
 * - Tasks with photos: +2 points per photo (max 8 points)
 * - Different categories get bonus points
 * - Recent tasks (within 3 days): +3 points
 * - Urgent tasks: +2 points
 */
function calculateDiversityScore(
  task: FeaturedTask,
  seenCategories: Set<string>
): number {
  let score = 0

  // Images bonus (up to 8 points)
  if (task.images && task.images.length > 0) {
    score += Math.min(task.images.length * 2, 8)
  }

  // Category diversity bonus (5 points for new category)
  if (!seenCategories.has(task.category)) {
    score += 5
  }

  // Recency bonus (within 3 days)
  const createdAt = new Date(task.created_at).getTime()
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
  if (createdAt > threeDaysAgo) {
    score += 3
  }

  // Urgency bonus
  if (task.urgency === 'same_day') {
    score += 2
  }

  return score
}

/**
 * Fetch recent tasks with diversity scoring
 * Prioritizes tasks with images and category diversity
 * Limits to 8 tasks total
 *
 * Shows open, in_progress, and completed tasks to demonstrate platform activity
 * Only excludes cancelled tasks
 */
export async function getFeaturedTasks(): Promise<FeaturedTask[]> {
  try {
    console.log('[getFeaturedTasks] Starting fetch...')
    const supabase = await createClient()

    // @todo TEMPORARY: Remove 'cancelled' from status filter once we have more real tasks
    // Fetch all recent tasks including cancelled (for platform activity display)
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['open', 'in_progress', 'completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(50) // Fetch 50 to have good pool for diversity

    if (error) {
      console.error('[getFeaturedTasks] Database error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return []
    }

    if (!tasks || tasks.length === 0) {
      console.log('[getFeaturedTasks] No tasks found in database')
      return []
    }

    console.log('[getFeaturedTasks] Found', tasks.length, 'recent tasks')

    // Calculate diversity scores
    const seenCategories = new Set<string>()
    const tasksWithScores = tasks.map((task) => {
      const score = calculateDiversityScore(task, seenCategories)
      seenCategories.add(task.category)
      return { task, score }
    })

    // Sort by score (highest first) and take top 12
    tasksWithScores.sort((a, b) => b.score - a.score)
    const featuredTasks = tasksWithScores.slice(0, 12).map((item) => item.task)

    console.log('[getFeaturedTasks] Returning', featuredTasks.length, 'featured tasks')
    return featuredTasks
  } catch (error) {
    console.error('[getFeaturedTasks] Unexpected error:', error)
    return []
  }
}
