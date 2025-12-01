import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/category-feedback
 * Saves feedback when user manually selects a category after keyword matching fails
 * Used for improving the keyword database over time
 *
 * Fire-and-forget - non-blocking, best effort
 */
export async function POST(request: Request) {
  try {
    const { title, subcategory, language } = await request.json()

    // Basic validation
    if (!title || !subcategory || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Limit title length to prevent abuse
    const trimmedTitle = title.trim().slice(0, 200)
    if (trimmedTitle.length < 3) {
      return NextResponse.json(
        { error: 'Title too short' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert feedback record (fire-and-forget, errors are logged but not blocking)
    const { error } = await supabase
      .from('category_suggestions_feedback')
      .insert({
        title: trimmedTitle,
        matched_subcategory: subcategory,
        language: language.slice(0, 5),
      })

    if (error) {
      console.error('Failed to save category feedback:', error)
      // Still return success - this is non-critical analytics
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category feedback error:', error)
    // Return success even on error - non-blocking analytics
    return NextResponse.json({ success: true })
  }
}
