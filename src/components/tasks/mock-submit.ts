import type { ApplicationFormData, ApplicationSubmissionResponse } from './types'

/**
 * Mock function to simulate application submission
 * In production, this would call an API endpoint
 *
 * @param data - Application form data
 * @returns Promise with submission response
 */
export async function submitApplication(
  data: ApplicationFormData
): Promise<ApplicationSubmissionResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock success response
  return {
    success: true,
    applicationId: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: 'Application submitted successfully',
  }
}

/**
 * Store application in localStorage for mock persistence
 * This simulates saving to a database
 */
export function storeApplicationLocally(
  taskId: string,
  userId: string,
  applicationId: string,
  data: ApplicationFormData
): void {
  const key = `application-${taskId}-${userId}`
  const applicationData = {
    id: applicationId,
    taskId,
    userId,
    ...data,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(key, JSON.stringify(applicationData))
}

/**
 * Check if user has already applied to a task
 */
export function hasUserApplied(taskId: string, userId: string): boolean {
  const key = `application-${taskId}-${userId}`
  return localStorage.getItem(key) !== null
}

/**
 * Get user's application for a task
 */
export function getUserApplication(taskId: string, userId: string) {
  const key = `application-${taskId}-${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}
