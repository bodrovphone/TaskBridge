import type { TaskHint } from '@/components/ui/task-hint-banner'

interface Task {
  id: string
  title: string
  description: string
  category: string
  budget: number
  location: {
    city: string
    neighborhood?: string
  }
  createdAt: Date
  applicationsCount: number
  urgency?: 'same_day' | 'within_week' | 'flexible'
}

/**
 * Generate improvement hints for a task based on its data
 * Now using general, always-applicable suggestions
 */
export function generateTaskHints(_task: Task, t: (key: string, params?: any) => string): TaskHint[] {
  // Return general suggestions that are always applicable
  const hints: TaskHint[] = [
    {
      type: 'increase_price',
      priority: 'high',
      message: t('taskHints.suggestions.increasePrice')
    },
    {
      type: 'add_photos',
      priority: 'high',
      message: t('taskHints.suggestions.addPhotos')
    },
    {
      type: 'improve_description',
      priority: 'medium',
      message: t('taskHints.suggestions.improveDescription')
    },
    {
      type: 'adjust_deadline',
      priority: 'medium',
      message: t('taskHints.suggestions.adjustDeadline')
    },
    {
      type: 'update_task',
      priority: 'low',
      message: t('taskHints.suggestions.updateTask')
    }
  ]

  // Return max 3 hints for cleaner UI
  return hints.slice(0, 3)
}

/**
 * Check if task should show hints
 */
export function shouldShowTaskHints(task: Task): boolean {
  // Only show hints for open tasks
  if ((task as any).status !== 'open') {
    return false
  }

  // Task must be at least 2 days old (reduced from 7 for development/MVP)
  const taskAgeDays = Math.floor((Date.now() - task.createdAt.getTime()) / (24 * 60 * 60 * 1000))
  if (taskAgeDays < 2) {
    return false
  }

  // Show hints only if task has 0 applications
  if (task.applicationsCount > 0) {
    return false
  }

  return true
}

/**
 * Calculate task age in days
 */
export function getTaskAgeDays(createdAt: Date): number {
  return Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000))
}
