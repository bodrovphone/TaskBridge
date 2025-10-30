/**
 * Task Detail API Route
 * Handles individual task operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskService } from '@/server/tasks/task.service'
import { isAppError } from '@/server/shared/errors'
import type { UpdateTaskInput } from '@/server/tasks/task.types'

/**
 * GET /api/tasks/[id]
 * Get single task by ID with privacy filtering
 *
 * Auto-detects viewer from session for privacy filtering
 * Returns task with related metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Await params (Next.js 15 requirement)
    const { id } = await params

    // 1. Get current user (optional - for privacy filtering)
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    // 2. Get task
    const taskService = new TaskService()
    const result = await taskService.getTaskDetail(id, authUser?.id)

    // 3. Handle result
    if (!result.success) {
      const error = result.error as Error

      if (isAppError(error)) {
        return NextResponse.json(
          { error: error.message, code: (error as any).code },
          { status: (error as any).statusCode }
        )
      }

      return NextResponse.json(
        { error: 'message' in error ? error.message : 'Failed to fetch task' },
        { status: 500 }
      )
    }

    // 4. Return task
    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task
 *
 * Requires authentication and task ownership
 * Only the task owner (customer) can update their task
 *
 * Request body: Partial<UpdateTaskInput>
 * - Only include fields you want to update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Await params (Next.js 15 requirement)
    const { id } = await params

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
    let input: UpdateTaskInput
    try {
      input = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 3. Update task via service
    const taskService = new TaskService()
    const result = await taskService.updateTask(id, input, authUser.id)

    // 4. Handle result
    if (!result.success) {
      const error = result.error as Error

      if (isAppError(error)) {
        return NextResponse.json(
          {
            error: error.message,
            code: (error as any).code,
            details: (error as any).details
          },
          { status: (error as any).statusCode }
        )
      }

      return NextResponse.json(
        { error: 'message' in error ? error.message : 'Failed to update task' },
        { status: 500 }
      )
    }

    // 5. Return updated task
    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
