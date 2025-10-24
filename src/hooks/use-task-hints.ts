import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskHint } from '@/components/ui/task-hint-banner'
import { generateTaskHints, shouldShowTaskHints, getTaskAgeDays } from '@/lib/services/task-hints'

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
  status?: string
}

interface DismissedHint {
  taskId: string
  dismissedAt: number
  expiresAt: number
}

const DISMISSAL_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const STORAGE_KEY = 'taskHintDismissals'

/**
 * Hook to manage task hints with dismissal state
 */
export function useTaskHints(task: Task) {
  const { t } = useTranslation()
  const [hints, setHints] = useState<TaskHint[]>([])
  const [shouldShow, setShouldShow] = useState(false)
  const [taskAge, setTaskAge] = useState(0)

  useEffect(() => {
    // Check if hints should be shown
    const show = shouldShowTaskHints(task)

    if (!show) {
      setShouldShow(false)
      setHints([])
      return
    }

    // Check if hint was recently dismissed
    if (isRecentlyDismissed(task.id)) {
      setShouldShow(false)
      setHints([])
      return
    }

    // Generate hints
    const generatedHints = generateTaskHints(task, t)
    const age = getTaskAgeDays(task.createdAt)

    setHints(generatedHints)
    setTaskAge(age)
    setShouldShow(generatedHints.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, task.status, task.applicationsCount, task.createdAt.getTime(), t])

  const dismiss = () => {
    // Store dismissal in localStorage
    storeDismissal(task.id)

    // Hide hints
    setShouldShow(false)
  }

  return {
    hints,
    shouldShow,
    taskAge,
    dismiss
  }
}

/**
 * Check if hint was dismissed within the last 24 hours
 */
function isRecentlyDismissed(taskId: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false

    const dismissals: DismissedHint[] = JSON.parse(stored)
    const dismissal = dismissals.find(d => d.taskId === taskId)

    if (!dismissal) return false

    // Check if dismissal has expired
    const now = Date.now()
    if (now > dismissal.expiresAt) {
      // Clean up expired dismissal
      cleanupExpiredDismissals()
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking dismissal status:', error)
    return false
  }
}

/**
 * Store a hint dismissal in localStorage
 */
function storeDismissal(taskId: string): void {
  try {
    const now = Date.now()
    const dismissal: DismissedHint = {
      taskId,
      dismissedAt: now,
      expiresAt: now + DISMISSAL_DURATION
    }

    // Get existing dismissals
    const stored = localStorage.getItem(STORAGE_KEY)
    let dismissals: DismissedHint[] = stored ? JSON.parse(stored) : []

    // Remove any existing dismissal for this task
    dismissals = dismissals.filter(d => d.taskId !== taskId)

    // Add new dismissal
    dismissals.push(dismissal)

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals))
  } catch (error) {
    console.error('Error storing dismissal:', error)
  }
}

/**
 * Clean up expired dismissals from localStorage
 */
function cleanupExpiredDismissals(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const dismissals: DismissedHint[] = JSON.parse(stored)
    const now = Date.now()

    // Filter out expired dismissals
    const active = dismissals.filter(d => d.expiresAt > now)

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active))
  } catch (error) {
    console.error('Error cleaning up dismissals:', error)
  }
}

/**
 * Get time remaining until dismissal expires (for dev/debug purposes)
 */
export function getDismissalTimeRemaining(taskId: string): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const dismissals: DismissedHint[] = JSON.parse(stored)
    const dismissal = dismissals.find(d => d.taskId === taskId)

    if (!dismissal) return null

    const now = Date.now()
    const remaining = dismissal.expiresAt - now

    return remaining > 0 ? remaining : null
  } catch (error) {
    console.error('Error getting dismissal time:', error)
    return null
  }
}
