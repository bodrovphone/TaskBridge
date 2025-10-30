import type { TaskHint } from '@/components/ui/task-hint-banner'

/**
 * Mock category statistics for hint generation
 * In production, these would come from database aggregations
 */
const CATEGORY_STATS: Record<string, { averageBudget: number; medianBudget: number }> = {
  'categories.houseCleaning': { averageBudget: 120, medianBudget: 100 },
  'categories.plumbing': { averageBudget: 150, medianBudget: 130 },
  'categories.electrical': { averageBudget: 180, medianBudget: 160 },
  'categories.painting': { averageBudget: 200, medianBudget: 180 },
  'categories.carpentry': { averageBudget: 250, medianBudget: 220 },
  'categories.moving': { averageBudget: 300, medianBudget: 250 },
  'categories.computerRepair': { averageBudget: 100, medianBudget: 80 },
  'categories.applianceRepair': { averageBudget: 120, medianBudget: 100 },
  'categories.gardening': { averageBudget: 150, medianBudget: 120 },
  'categories.petCare': { averageBudget: 80, medianBudget: 60 },
  // Add default for unknown categories
  'default': { averageBudget: 150, medianBudget: 120 }
}

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
 */
export function generateTaskHints(task: Task, t: (key: string, params?: any) => string): TaskHint[] {
  const hints: TaskHint[] = []

  // Budget analysis
  const budgetHints = analyzeBudget(task, t)
  hints.push(...budgetHints)

  // Description quality
  const descriptionHints = analyzeDescription(task, t)
  hints.push(...descriptionHints)

  // Location completeness
  const locationHints = analyzeLocation(task, t)
  hints.push(...locationHints)

  // Timeline realism
  const timelineHints = analyzeTimeline(task, t)
  hints.push(...timelineHints)

  // Sort by priority (high -> medium -> low)
  const priorityWeight = { high: 1, medium: 2, low: 3 }
  hints.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])

  // Return max 3 hints (highest priority)
  return hints.slice(0, 3)
}

/**
 * Analyze task budget compared to category average
 */
function analyzeBudget(task: Task, t: (key: string, params?: any) => string): TaskHint[] {
  const categoryStats = CATEGORY_STATS[task.category] || CATEGORY_STATS['default']
  const ratio = task.budget / categoryStats.averageBudget

  if (ratio < 0.5) {
    // Budget is less than 50% of average - HIGH priority
    return [{
      type: 'budget_very_low',
      priority: 'high',
      message: t('taskHints.suggestions.budgetVeryLow', {
        current: task.budget,
        average: Math.round(categoryStats.averageBudget)
      })
    }]
  }

  if (ratio < 0.7) {
    // Budget is less than 70% of average - MEDIUM priority
    return [{
      type: 'budget_low',
      priority: 'medium',
      message: t('taskHints.suggestions.budgetLow', {
        average: Math.round(categoryStats.averageBudget)
      })
    }]
  }

  return []
}

/**
 * Analyze description quality and length
 */
function analyzeDescription(task: Task, t: (key: string, params?: any) => string): TaskHint[] {
  const descriptionLength = task.description.length

  if (descriptionLength < 20) {
    // Very short description - HIGH priority
    return [{
      type: 'description_very_short',
      priority: 'high',
      message: t('taskHints.suggestions.descriptionShort')
    }]
  }

  if (descriptionLength < 50) {
    // Short description - MEDIUM priority
    return [{
      type: 'description_short',
      priority: 'medium',
      message: t('taskHints.suggestions.descriptionShort')
    }]
  }

  return []
}

/**
 * Analyze location completeness
 */
function analyzeLocation(task: Task, t: (key: string, params?: any) => string): TaskHint[] {
  const hasCity = task.location?.city && task.location.city.trim().length > 0
  const hasNeighborhood = task.location?.neighborhood && task.location.neighborhood.trim().length > 0

  if (!hasCity || !hasNeighborhood) {
    // Missing location info - HIGH priority
    return [{
      type: 'location_missing',
      priority: 'high',
      message: t('taskHints.suggestions.locationMissing')
    }]
  }

  return []
}

/**
 * Analyze timeline realism
 */
function analyzeTimeline(task: Task, t: (key: string, params?: any) => string): TaskHint[] {
  const taskAgeDays = Math.floor((Date.now() - task.createdAt.getTime()) / (24 * 60 * 60 * 1000))

  // If task is same_day urgency but has been open for more than 1 day
  if (task.urgency === 'same_day' && taskAgeDays > 1) {
    return [{
      type: 'urgency_unrealistic',
      priority: 'medium',
      message: t('taskHints.suggestions.urgencyUnrealistic')
    }]
  }

  return []
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

  // Show hints if task has few applications (0-2)
  if (task.applicationsCount > 2) {
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
