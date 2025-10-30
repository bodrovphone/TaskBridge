/**
 * Task Detail API Route
 * Handles individual task operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskService } from '@/server/tasks/task.service'
import { isAppError } from '@/server/shared/errors'

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
