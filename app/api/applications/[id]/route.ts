import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { applications } from '@/shared/schema'
import { eq } from 'drizzle-orm'

// Update application
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(applications.id, params.id))
      .returning()

    if (!updatedApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}