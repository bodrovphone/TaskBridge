import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { tasks, applications, insertApplicationSchema } from '@/shared/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

interface RouteContext {
  params: { id: string }
}

// Get applications for a task
export async function GET(request: NextRequest, { params }: RouteContext) {
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
      return NextResponse.json({ error: 'Not authorized to view applications' }, { status: 403 })
    }

    const taskApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.taskId, params.id))
      .orderBy(applications.createdAt)

    return NextResponse.json(taskApplications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create application for a task
export async function POST(request: NextRequest, { params }: RouteContext) {
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

    if (task[0].customerId === session.user.id) {
      return NextResponse.json({ error: 'Cannot apply to your own task' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = insertApplicationSchema.parse({
      ...body,
      taskId: params.id,
      professionalId: session.user.id,
    })

    const [newApplication] = await db
      .insert(applications)
      .values(validatedData)
      .returning()

    return NextResponse.json(newApplication, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid application data', errors: error.errors }, { status: 400 })
    }
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}