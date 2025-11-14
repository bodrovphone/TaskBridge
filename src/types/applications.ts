/**
 * Application types for task applications management
 */

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'removed_by_customer'

export interface ProfessionalReview {
  id: string
  reviewerName: string
  reviewerAvatar: string
  rating: number
  comment: string
  createdAt: Date
  taskCategory: string
}

export interface ApplicationProfessional {
  id: string
  name: string
  avatar: string | null
  rating: number
  completedTasks: number
  skills: string[]  // Maps to service_categories in database
  hourlyRate: number | null
  bio: string | null
  city: string | null
  reviews?: ProfessionalReview[]
  yearsOfExperience?: number
  verified?: boolean
}

export interface Application {
  id: string
  taskId: string
  professional: ApplicationProfessional
  proposedPrice: number
  currency: string
  timeline: string
  message: string
  portfolioImages?: string[]
  experience?: string
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
  rejectionReason?: string
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'experience'

export interface ApplicationFilters {
  status: ApplicationStatus | 'all'
  sortBy: SortOption
}

export interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}
