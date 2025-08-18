import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { tasks, reviews, insertReviewSchema } from '@/shared/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

interface RouteContext {
  params: { id: string }
}

// Create review for a task
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

    const userId = session.user.id
    if (task[0].customerId !== userId && task[0].selectedProfessionalId !== userId) {
      return NextResponse.json({ error: 'Not authorized to review this task' }, { status: 403 })
    }

    const revieweeId = task[0].customerId === userId ? task[0].selectedProfessionalId : task[0].customerId
    const reviewerType = task[0].customerId === userId ? "customer" : "professional"

    const body = await request.json()
    const validatedData = insertReviewSchema.parse({
      ...body,
      taskId: params.id,
      reviewerId: userId,
      revieweeId,
      reviewerType,
    })

    const [newReview] = await db
      .insert(reviews)
      .values(validatedData)
      .returning()

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid review data', errors: error.errors }, { status: 400 })
    }
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}