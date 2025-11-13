/**
 * Vercel Cron Job: Publish Delayed Reviews
 *
 * Runs daily at 2 AM UTC to find reviews that have become published
 * (published_at <= NOW()) and recalculates professional ratings.
 *
 * This ensures that delayed reviews (e.g., 1 week delay for user safety)
 * eventually affect the professional's rating when they become visible.
 *
 * Security: Requires CRON_SECRET environment variable for authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds max execution time

export async function GET(request: NextRequest) {
  console.log('[Cron] Publish delayed reviews job started')

  // Security: Verify cron secret
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET) {
    console.error('[Cron] CRON_SECRET environment variable not set')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== expectedAuth) {
    console.error('[Cron] Unauthorized access attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminClient()

    // Find reviews that became published in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    console.log('[Cron] Checking for newly published reviews between', yesterday, 'and', now)

    const { data: newlyPublished, error: fetchError } = await supabase
      .from('reviews')
      .select('id, reviewee_id, rating, published_at')
      .lte('published_at', now)
      .gte('published_at', yesterday)
      .eq('review_type', 'customer_to_professional')
      .eq('is_hidden', false)

    if (fetchError) {
      console.error('[Cron] Error fetching newly published reviews:', fetchError)
      return NextResponse.json(
        { error: 'Database query failed', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!newlyPublished || newlyPublished.length === 0) {
      console.log('[Cron] No newly published reviews found')
      return NextResponse.json({
        success: true,
        message: 'No reviews to publish',
        count: 0,
        professionals: []
      })
    }

    console.log(`[Cron] Found ${newlyPublished.length} newly published reviews`)

    // Get unique professional IDs
    const professionalIds = [...new Set(newlyPublished.map(r => r.reviewee_id))]
    console.log(`[Cron] Affected professionals: ${professionalIds.length}`)

    // Recalculate ratings for each affected professional
    const results = []
    for (const profId of professionalIds) {
      try {
        const { error: rpcError } = await supabase
          .rpc('recalculate_professional_rating', { professional_id: profId })

        if (rpcError) {
          console.error(`[Cron] Failed to recalculate rating for ${profId}:`, rpcError)
          results.push({ professionalId: profId, success: false, error: rpcError.message })
        } else {
          console.log(`[Cron] Successfully recalculated rating for ${profId}`)
          results.push({ professionalId: profId, success: true })
        }
      } catch (err) {
        console.error(`[Cron] Exception recalculating rating for ${profId}:`, err)
        results.push({
          professionalId: profId,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`[Cron] Job completed: ${successCount} succeeded, ${failureCount} failed`)

    return NextResponse.json({
      success: true,
      message: 'Delayed reviews published',
      reviewsProcessed: newlyPublished.length,
      professionalsAffected: professionalIds.length,
      successCount,
      failureCount,
      results
    })

  } catch (error) {
    console.error('[Cron] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
