/**
 * DeepL Usage API
 * Check current DeepL API quota usage
 *
 * GET /api/admin/deepl-usage
 */

import { NextResponse } from 'next/server'
import { checkDeepLUsage } from '@/lib/services/translation'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Get DeepL usage from API
    const usage = await checkDeepLUsage()

    if (!usage) {
      return NextResponse.json(
        { error: 'Failed to fetch DeepL usage or API key not configured' },
        { status: 500 }
      )
    }

    // Check if quota is marked as exceeded in DB
    let quotaExceededAt: string | null = null
    let daysRemaining: number | null = null

    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'deepl_quota_exceeded_at')
        .single()

      if (data?.value) {
        quotaExceededAt = data.value
        const exceededDate = new Date(data.value)
        const now = new Date()
        const daysSince = (now.getTime() - exceededDate.getTime()) / (1000 * 60 * 60 * 24)
        daysRemaining = Math.max(0, Math.ceil(30 - daysSince))
      }
    } catch {
      // Table might not exist yet, ignore
    }

    return NextResponse.json({
      deepl: {
        used: usage.used,
        limit: usage.limit,
        remaining: usage.limit - usage.used,
        percentUsed: usage.percentUsed,
      },
      quotaStatus: {
        isExceeded: quotaExceededAt !== null && daysRemaining !== null && daysRemaining > 0,
        exceededAt: quotaExceededAt,
        daysRemaining,
      },
      message: usage.percentUsed >= 90
        ? '⚠️ Warning: Approaching quota limit!'
        : usage.percentUsed >= 75
          ? '📊 Quota usage is moderate'
          : '✅ Quota usage is healthy'
    })
  } catch (error) {
    console.error('[DeepL Usage API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
