import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professionals/[id]/basic-info
 * Fetches basic professional information (name only) for UI display
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: professionalId } = await params

    // Fetch professional's basic info
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', professionalId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: data.id,
      name: data.full_name,
    })
  } catch (error) {
    console.error('Error fetching professional info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
