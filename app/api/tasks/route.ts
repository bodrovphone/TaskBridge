import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { tasks, insertTaskSchema } from '@/shared/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    let query = db.select().from(tasks)

    if (category) {
      query = query.where(eq(tasks.category, category))
    }

    query = query.orderBy(desc(tasks.createdAt))

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const taskList = await query
    return NextResponse.json(taskList)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = insertTaskSchema.parse({
      ...body,
      customerId: session.user.id,
    })

    const [newTask] = await db
      .insert(tasks)
      .values(validatedData)
      .returning()

    return NextResponse.json(newTask)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}