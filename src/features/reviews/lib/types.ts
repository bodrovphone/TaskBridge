// Review system types and interfaces

export interface PendingReviewTask {
  id: string
  title: string
  professionalId: string
  professionalName: string
  professionalAvatar?: string
  completedAt: Date
  daysAgo: number
}

export interface ReviewSubmitData {
  taskId: string
  rating: number // 1-5, required
  reviewText?: string
  actualPricePaid?: number
}

export interface Review {
  id: string
  taskId: string
  reviewerId: string
  revieweeId: string
  rating: number
  reviewText?: string
  actualPricePaid?: number
  createdAt: Date
}

export type BlockType = 'pending_confirmation' | 'missing_reviews' | null

export interface CanCreateTaskResponse {
  canCreate: boolean
  blockType: BlockType
  pendingTasks: PendingReviewTask[]
  gracePeriodUsed?: number // 0-3
  unreviewedCount?: number
}
