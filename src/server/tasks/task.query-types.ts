/**
 * Query types for GET /api/tasks endpoint
 * Handles filtering, sorting, and pagination
 */

import type { TaskStatus } from './task.types'

/**
 * Raw query parameters from URL (before parsing)
 */
export interface TaskQueryParams {
  // Filtering
  customerId?: string        // Filter by task owner (for posted mode)
  status?: string | string[]
  category?: string
  subcategory?: string
  city?: string
  neighborhood?: string
  search?: string
  isUrgent?: boolean | string
  budgetMin?: string | number
  budgetMax?: string | number

  // Sorting
  sortBy?: string

  // Pagination
  page?: string | number
  limit?: string | number

  // Preset modes
  mode?: TaskQueryMode
}

/**
 * Parsed and validated query options (after parsing)
 */
export interface TaskQueryOptions {
  // Filters (all optional)
  filters: {
    customerId?: string      // Filter by task owner
    status?: TaskStatus[]
    category?: string
    subcategory?: string
    city?: string
    neighborhood?: string
    search?: string
    isUrgent?: boolean
    budgetMin?: number
    budgetMax?: number
  }

  // Sorting
  sort: {
    field: string
    ascending: boolean
  }

  // Pagination
  pagination: {
    page: number
    limit: number
    offset: number
  }

  // Context (viewer for privacy filtering)
  viewerId?: string
}

/**
 * Sort options for tasks
 */
export type TaskSortOption =
  | 'newest'           // created_at DESC (default)
  | 'oldest'           // created_at ASC
  | 'deadline'         // deadline ASC (earliest deadline first)
  | 'budget_high'      // budget_max_bgn DESC
  | 'budget_low'       // budget_min_bgn ASC
  | 'urgent'           // is_urgent DESC, created_at DESC

/**
 * Preset query modes for common use cases
 */
export type TaskQueryMode =
  | 'browse'           // Open tasks only, public view
  | 'posted'           // Customer's posted tasks (requires auth)
  | 'applications'     // Tasks with professional's applications (requires auth)

/**
 * Paginated response for task lists
 */
export interface PaginatedTasksResponse<T = any> {
  tasks: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Single task detail response with related data
 */
export interface TaskDetailResponse<T = any> {
  task: T
  relatedData: {
    applicationsCount: number
    isOwner: boolean
    userHasApplied?: boolean
  }
}
