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
 * Hides exact address and location notes from non-owners
 */
export const applyPrivacyFilter = (
  task: Task,
  viewerId?: string
): Task => {
  if (isTaskOwner(task, viewerId)) {
    return task // Owner sees everything
  }

  // Non-owner: hide sensitive location data
  return {
    ...task,
    address: null,
    location_notes: null
  }
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
