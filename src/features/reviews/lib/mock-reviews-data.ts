// Mock data for testing review enforcement system
// This will be replaced with real API calls in Phase 2 (Backend implementation)

import type { PendingReviewTask, CanCreateTaskResponse, ReviewSubmitData, Review } from './types'

// Simulate localStorage for persisting mock state during development
const STORAGE_KEY = 'taskbridge_mock_pending_reviews'

function getPendingReviewsFromStorage(): PendingReviewTask[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getInitialMockReviews()

    const parsed = JSON.parse(stored)
    // Convert date strings back to Date objects
    return parsed.map((task: any) => ({
      ...task,
      completedAt: new Date(task.completedAt)
    }))
  } catch {
    return getInitialMockReviews()
  }
}

function savePendingReviewsToStorage(tasks: PendingReviewTask[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Failed to save pending reviews to storage:', error)
  }
}

function getInitialMockReviews(): PendingReviewTask[] {
  const now = Date.now()
  return [
    {
      id: 'task-mock-1',
      title: 'Kitchen sink plumbing repair',
      professionalId: 'prof-1',
      professionalName: 'Ivan Georgiev',
      professionalAvatar: undefined,
      completedAt: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      daysAgo: 3
    },
    {
      id: 'task-mock-2',
      title: 'Apartment deep cleaning',
      professionalId: 'prof-2',
      professionalName: 'Maria Petrova',
      professionalAvatar: undefined,
      completedAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      daysAgo: 7
    }
  ]
}

/**
 * Mock function to check if user can create a new task
 * In Phase 2, this will be replaced with: GET /api/tasks/can-create?userId={userId}
 */
export function mockCanCreateTask(): CanCreateTaskResponse {
  const pendingTasks = getPendingReviewsFromStorage()

  return {
    canCreate: pendingTasks.length === 0,
    blockType: pendingTasks.length > 0 ? 'missing_reviews' : null,
    pendingTasks,
    gracePeriodUsed: 3, // Mock: user has used all 3 grace periods
    unreviewedCount: pendingTasks.length
  }
}

/**
 * Mock function to get pending reviews for a user
 * In Phase 2, this will be replaced with: GET /api/reviews/pending?userId={userId}
 */
export function mockGetPendingReviews(): PendingReviewTask[] {
  return getPendingReviewsFromStorage()
}

/**
 * Mock function to submit a review
 * In Phase 2, this will be replaced with: POST /api/reviews
 */
export async function mockSubmitReview(data: ReviewSubmitData): Promise<Review> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Remove the reviewed task from pending reviews
  const pendingTasks = getPendingReviewsFromStorage()
  const updatedTasks = pendingTasks.filter(task => task.id !== data.taskId)
  savePendingReviewsToStorage(updatedTasks)

  // Create mock review object
  const review: Review = {
    id: `review-${Date.now()}`,
    taskId: data.taskId,
    reviewerId: 'current-user-mock',
    revieweeId: 'professional-mock',
    rating: data.rating,
    reviewText: data.reviewText,
    actualPricePaid: data.actualPricePaid,
    createdAt: new Date()
  }

  return review
}

/**
 * Reset mock data to initial state (useful for testing)
 */
export function mockResetPendingReviews(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Add a mock pending review (useful for testing)
 */
export function mockAddPendingReview(task: Omit<PendingReviewTask, 'daysAgo'>): void {
  const pendingTasks = getPendingReviewsFromStorage()
  const now = Date.now()
  const daysAgo = Math.floor((now - task.completedAt.getTime()) / (24 * 60 * 60 * 1000))

  pendingTasks.push({
    ...task,
    daysAgo
  })

  savePendingReviewsToStorage(pendingTasks)
}
