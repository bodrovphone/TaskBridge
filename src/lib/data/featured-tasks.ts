import { createClient } from '@/lib/supabase/server'

interface Task {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  budget_min: number
  budget_max: number
  budget_type: string
  city: string
  neighborhood: string
  deadline: string
  urgency: string
  requirements: string
  images: string[] // Database field name
  status: string
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
  task: Task,
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
  if (task.urgency === 'asap' || task.urgency === 'within_day') {
    score += 2
  }

  return score
}

/**
 * Fetch featured tasks with diversity scoring
 * Prioritizes tasks with images and category diversity
 * Limits to 8 tasks total
 *
 * IMPORTANT: Only fetches tasks with status='open'
 * Featured tasks should only show available work that professionals can apply to
 */
export async function getFeaturedTasks(): Promise<Task[]> {
  try {
    const supabase = await createClient()

    // HARDCODED: Only fetch open tasks
    // Featured tasks must be available for application - no completed/cancelled/in-progress tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open') // Only show available tasks
      .order('created_at', { ascending: false })
      .limit(50) // Fetch 50 to have good pool for diversity

    if (error) {
      console.error('Error fetching featured tasks:', error)
      return []
    }

    if (!tasks || tasks.length === 0) {
      return []
    }

    // Calculate diversity scores
    const seenCategories = new Set<string>()
    const tasksWithScores = tasks.map((task) => {
      const score = calculateDiversityScore(task, seenCategories)
      seenCategories.add(task.category)
      return { task, score }
    })

    // Sort by score (highest first) and take top 8
    tasksWithScores.sort((a, b) => b.score - a.score)
    const featuredTasks = tasksWithScores.slice(0, 8).map((item) => item.task)

    return featuredTasks
  } catch (error) {
    console.error('Unexpected error fetching featured tasks:', error)
    return []
  }
}
