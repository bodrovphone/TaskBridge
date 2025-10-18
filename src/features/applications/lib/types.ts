/**
 * Professional Applications - Type Definitions
 *
 * These types represent applications from the PROFESSIONAL's perspective
 * (applications they have submitted to tasks)
 */

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export interface MyApplication {
  id: string
  taskId: string
  task: {
    id: string
    title: string
    description: string
    category: string
    subcategory?: string
    budget: {
      min: number
      max: number
      type: 'fixed' | 'hourly' | 'negotiable'
    }
    location: {
      city: string
      neighborhood?: string
    }
    deadline?: Date
    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  }
  customer: {
    id: string
    name: string // Partial name like "John D." if not accepted
    avatar?: string
    rating?: number
    reviewsCount?: number
    // Contact info only shown if application is accepted
    phone?: string
    email?: string
    address?: string
  }
  myProposal: {
    price: number
    currency: string
    timeline: string
    message: string
  }
  status: ApplicationStatus
  appliedAt: Date
  respondedAt?: Date
  rejectionReason?: string
  otherApplicantsCount?: number
  startDate?: Date // For accepted applications
  taskCompletedAt?: Date // For completed tasks
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'status'
  | 'taskDate'
  | 'priceHigh'
  | 'priceLow'

export type FilterOption =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
