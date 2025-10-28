/**
 * Task validation logic
 * Server-side validation using Zod
 */

import { z } from 'zod'
import { ValidationError } from '../shared/errors'
import { Result, ok, err } from '../shared/result'
import type { CreateTaskInput } from './task.types'

/**
 * Validation schema for task creation
 */
export const createTaskSchema = z.object({
  // Required fields
  category: z.string().min(1, 'Category is required'),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  city: z.string().min(1, 'City is required'),

  // Optional fields
  subcategory: z.string().optional(),
  neighborhood: z.string().optional(),
  exactAddress: z.string().optional(),

  // Budget (optional)
  budgetType: z.enum(['fixed', 'range']).optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),

  // Timeline
  urgency: z.enum(['same_day', 'within_week', 'flexible']).optional(),
  deadline: z.string().optional(), // ISO date string

  // Media
  photoUrls: z.array(z.string().url()).max(5, 'Maximum 5 photos allowed').optional()
}).refine(
  (data) => {
    // If budget type is 'range' and both values provided, max must be > min
    if (data.budgetType === 'range' && data.budgetMin && data.budgetMax) {
      return data.budgetMax > data.budgetMin
    }
    return true
  },
  {
    message: 'Maximum budget must be greater than minimum budget',
    path: ['budgetMax']
  }
)

/**
 * Validate task creation input
 */
export const validateCreateTaskInput = (
  input: unknown
): Result<CreateTaskInput, ValidationError> => {
  const result = createTaskSchema.safeParse(input)

  if (!result.success) {
    const errors = result.error.errors.reduce((acc, error) => {
      const path = error.path.join('.')
      acc[path] = error.message
      return acc
    }, {} as Record<string, string>)

    return err(
      new ValidationError('Validation failed', {
        errors
      })
    )
  }

  return ok(result.data)
}

/**
 * Business rule: Check if user can create a task
 * Can be extended later with more complex rules
 */
export const canUserCreateTask = async (
  userId: string
): Promise<Result<void, ValidationError>> => {
  // For now, any authenticated user can create a task
  // Future: Check for pending confirmations, missing reviews, etc.

  if (!userId) {
    return err(new ValidationError('User ID is required'))
  }

  return ok(undefined)
}

/**
 * Validate image URLs
 */
export const validateImageUrls = (urls: string[]): Result<string[], ValidationError> => {
  if (urls.length > 5) {
    return err(new ValidationError('Maximum 5 images allowed'))
  }

  // Check if all URLs are valid
  const invalidUrls = urls.filter((url) => {
    try {
      new URL(url)
      return false
    } catch {
      return true
    }
  })

  if (invalidUrls.length > 0) {
    return err(
      new ValidationError('Invalid image URLs', {
        invalidUrls
      })
    )
  }

  return ok(urls)
}
