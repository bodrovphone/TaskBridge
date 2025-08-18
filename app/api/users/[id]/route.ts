import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { users, reviews, tasks } from '@/shared/schema'
import { eq, avg, count } from 'drizzle-orm'

interface RouteContext {
  params: { id: string }
}

// Get user reviews
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (endpoint === 'reviews') {
      const userReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.revieweeId, params.id))
        .orderBy(reviews.createdAt)

      return NextResponse.json(userReviews)
    }

    if (endpoint === 'stats') {
      const userStats = await db
        .select({
          averageRating: avg(reviews.overallRating),
          totalReviews: count(reviews.id),
          totalTasks: count(tasks.id)
        })
        .from(users)
        .leftJoin(reviews, eq(reviews.revieweeId, users.id))
        .leftJoin(tasks, eq(tasks.customerId, users.id))
        .where(eq(users.id, params.id))
        .groupBy(users.id)

      return NextResponse.json(userStats[0] || { averageRating: 0, totalReviews: 0, totalTasks: 0 })
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}