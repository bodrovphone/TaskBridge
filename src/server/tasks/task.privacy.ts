/**
 * Privacy filtering for tasks
 * Hides sensitive information from non-owners
 */

import type { Task } from './task.types'

/**
 * Check if viewer is task owner
 */
export const isTaskOwner = (task: Task, viewerId?: string): boolean => {
  if (!viewerId) return false
  return task.customer_id === viewerId
}

/**
 * Apply privacy filter to single task
 * Note: All task fields are now public (address field was removed)
 * Keeping this function for API compatibility
 */
export const applyPrivacyFilter = (
  task: Task,
  viewerId?: string
): Task => {
  // All task fields are now public (no sensitive address field)
  // location_notes (requirements) is visible to everyone
  return task
}

/**
 * Apply privacy filter to array of tasks
 */
export const applyPrivacyFilterBulk = (
  tasks: Task[],
  viewerId?: string
): Task[] => {
  return tasks.map(task => applyPrivacyFilter(task, viewerId))
}
