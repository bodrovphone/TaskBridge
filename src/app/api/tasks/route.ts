/**
 * Tasks API Route
 * Handles task creation and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskService } from '@/server/tasks/task.service'
import { isAppError } from '@/server/shared/errors'
import type { CreateTaskInput } from '@/server/tasks/task.types'

/**
 * POST /api/tasks
 * Create a new task
 *
 * Requires authentication
 *
 * Request body:
 * {
 *   category: string
 *   title: string
 *   description: string
 *   city: string
 *   subcategory?: string
 *   neighborhood?: string
 *   exactAddress?: string
 *   budgetType?: 'fixed' | 'range'
 *   budgetMin?: number
 *   budgetMax?: number
 *   urgency?: 'same_day' | 'within_week' | 'flexible'
 *   deadline?: string
 *   photoUrls?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    let input: CreateTaskInput
    try {
      input = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 3. Create service instance and execute use case
    const taskService = new TaskService()
    const result = await taskService.createTask(input, authUser.id)

    // 4. Handle result
    if (!result.success) {
      const error = result.error as Error

      // Check if it's our custom error with statusCode
      if (isAppError(error)) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details
          },
          { status: error.statusCode }
        )
      }

      // Fallback for unknown errors
      return NextResponse.json(
        { error: 'message' in error ? error.message : 'Failed to create task' },
        { status: 500 }
      )
    }

    // 5. Return success response
    return NextResponse.json(
      result.data,
      { status: 201 }
    )
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/tasks
 * Get tasks with flexible filtering, sorting, and pagination
 *
 * Query parameters:
 * - mode: 'browse' | 'posted' | 'applications'
 * - featured: 'true' - Get high-quality featured tasks (10 tasks with diversity)
 * - status: Task status filter (comma-separated)
 * - category: Filter by category
 * - city: Filter by city
 * - isUrgent: Filter urgent tasks
 * - budgetMin, budgetMax: Budget range
 * - sortBy: 'newest' | 'urgent' | 'budget_high' | 'budget_low' | 'deadline'
 * - page, limit: Pagination
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Get user from session (optional for browse mode, required for posted/applications)
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)

    // Check if this is a featured tasks request
    const isFeaturedRequest = searchParams.get('featured') === 'true'

    if (isFeaturedRequest) {
      // 3. Handle featured tasks request
      const taskService = new TaskService()
      const result = await taskService.getFeaturedTasks()

      if (!result.success) {
        const error = result.error as Error

        if (isAppError(error)) {
          return NextResponse.json(
            {
              error: error.message,
              code: error.code,
              details: (error as any).details
            },
            { status: (error as any).statusCode }
          )
        }

        return NextResponse.json(
          { error: 'message' in error ? error.message : 'Failed to fetch featured tasks' },
          { status: 500 }
        )
      }

      // Return featured tasks with simple pagination structure
      return NextResponse.json({
        tasks: result.data,
        pagination: {
          page: 1,
          limit: result.data.length,
          total: result.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      }, { status: 200 })
    }

    const params: import('@/server/tasks/task.query-types').TaskQueryParams = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      city: searchParams.get('city') || undefined,
      neighborhood: searchParams.get('neighborhood') || undefined,
      isUrgent: searchParams.get('isUrgent') || undefined,
      budgetMin: searchParams.get('budgetMin') || undefined,
      budgetMax: searchParams.get('budgetMax') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      mode: (searchParams.get('mode') as any) || undefined,
    }

    // 3. Handle protected modes with session-based auth
    if (params.mode === 'posted') {
      if (!authUser) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      // Auto-inject customerId from session for posted mode
      params.customerId = authUser.id
    }

    if (params.mode === 'applications') {
      if (!authUser) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      // Note: professionalId will be handled differently (join query)
      // For now, return empty result - will implement in Phase 4
      return NextResponse.json(
        {
          tasks: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
          }
        },
        { status: 200 }
      )
    }

    // 4. Execute query with viewerId from session
    const taskService = new TaskService()
    const result = await taskService.getTasks(params, authUser?.id)

    // 5. Handle result
    if (!result.success) {
      const error = result.error as Error

      if (isAppError(error)) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: (error as any).details
          },
          { status: (error as any).statusCode }
        )
      }

      return NextResponse.json(
        { error: 'message' in error ? error.message : 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // 6. Return success response
    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
