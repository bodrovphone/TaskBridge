import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { tasks, applications, reviews, insertApplicationSchema, insertReviewSchema } from '@/shared/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

interface RouteContext {
  params: { id: string }
}

// Get single task
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, params.id))
      .limit(1)

    if (!task[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task[0])
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update task
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, params.id))
      .limit(1)

    if (!task[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task[0].customerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this task' }, { status: 403 })
    }

    const body = await request.json()
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(tasks.id, params.id))
      .returning()

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete task
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, params.id))
      .limit(1)

    if (!task[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task[0].customerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this task' }, { status: 403 })
    }

    await db.delete(tasks).where(eq(tasks.id, params.id))

    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}