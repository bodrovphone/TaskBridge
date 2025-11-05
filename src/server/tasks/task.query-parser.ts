/**
 * Query parameter parsing and validation
 * Converts URL query params to TaskQueryOptions
 */

import type {
  TaskQueryParams,
  TaskQueryOptions,
  TaskSortOption,
  TaskQueryMode
} from './task.query-types'
import type { TaskStatus } from './task.types'
import { ValidationError } from '../shared/errors'
import { Result, ok, err } from '../shared/result'

/**
 * Valid task statuses
 */
const VALID_STATUSES: TaskStatus[] = [
  'draft',
  'open',
  'in_progress',
  'pending_customer_confirmation',
  'completed',
  'cancelled',
  'disputed'
]

/**
 * Parse and validate query parameters
 */
export const parseTaskQuery = (
  params: TaskQueryParams
): Result<TaskQueryOptions, ValidationError> => {
  try {
    // Parse pagination
    const page = Math.max(1, parseInt(String(params.page || '1')))
    const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || '20'))))
    const offset = (page - 1) * limit

    // Parse status filter (can be comma-separated string or array)
    let statusFilter: TaskStatus[] | undefined
    if (params.status) {
      const statusInput = Array.isArray(params.status)
        ? params.status
        : String(params.status).split(',')

      statusFilter = statusInput.filter(s =>
        VALID_STATUSES.includes(s as TaskStatus)
      ) as TaskStatus[]

      if (statusFilter.length === 0) {
        statusFilter = undefined
      }
    }

    // Parse boolean filters
    const isUrgent = params.isUrgent === undefined
      ? undefined
      : params.isUrgent === 'true' || params.isUrgent === true

    // Parse budget filters
    const budgetMin = params.budgetMin
      ? parseFloat(String(params.budgetMin))
      : undefined
    const budgetMax = params.budgetMax
      ? parseFloat(String(params.budgetMax))
      : undefined

    // Validate budget range
    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      return err(
        new ValidationError('Invalid budget range: minimum cannot be greater than maximum')
      )
    }

    // Parse sorting
    const sort = parseSortOption(params.sortBy || 'newest')

    // Apply mode presets
    const filters = applyModePresets(
      params,
      statusFilter,
      isUrgent,
      budgetMin,
      budgetMax
    )

    const options: TaskQueryOptions = {
      filters,
      sort,
      pagination: { page, limit, offset },
      viewerId: undefined // Will be set by service layer
    }

    return ok(options)
  } catch (error) {
    return err(
      new ValidationError('Invalid query parameters', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    )
  }
}

/**
 * Parse sort option into database field and direction
 */
const parseSortOption = (
  sortBy: string
): { field: string; ascending: boolean } => {
  switch (sortBy as TaskSortOption) {
    case 'newest':
      return { field: 'created_at', ascending: false }
    case 'oldest':
      return { field: 'created_at', ascending: true }
    case 'deadline':
      return { field: 'deadline', ascending: true }
    case 'budget_high':
      return { field: 'budget_max_bgn', ascending: false }
    case 'budget_low':
      return { field: 'budget_min_bgn', ascending: true }
    case 'urgent':
      // Sort by urgent flag, then by created date
      return { field: 'is_urgent', ascending: false }
    default:
      // Default to newest
      return { field: 'created_at', ascending: false }
  }
}

/**
 * Apply preset mode filters
 */
const applyModePresets = (
  params: TaskQueryParams,
  statusFilter?: TaskStatus[],
  isUrgent?: boolean,
  budgetMin?: number,
  budgetMax?: number
): TaskQueryOptions['filters'] => {
  const filters: TaskQueryOptions['filters'] = {
    customerId: params.customerId,
    status: statusFilter,
    category: params.category,
    subcategory: params.subcategory,
    city: params.city,
    neighborhood: params.neighborhood,
    isUrgent,
    budgetMin,
    budgetMax
  }

  // Apply mode presets
  switch (params.mode as TaskQueryMode) {
    case 'browse':
      // Browse mode: only open tasks
      filters.status = ['open']
      break

    case 'posted':
      // Posted mode: filters by customerId (injected in API route)
      // Status filter can be applied on top
      break

    case 'applications':
      // Applications mode: will use different repository method
      // Will filter by professionalId in service layer
      break
  }

  return filters
}
