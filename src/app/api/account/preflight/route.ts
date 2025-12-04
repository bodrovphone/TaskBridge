/**
 * Account Deletion Pre-flight Check API
 * Checks if user can delete their account (no active tasks in progress)
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/api-auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate request
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Call the pre-flight check function
    const supabaseAdmin = createAdminClient()

    const { data: blockersResult, error: blockersError } = await supabaseAdmin
      .rpc('check_account_deletion_blockers', { p_user_id: authUser.id })

    if (blockersError) {
      console.error('Preflight check error:', blockersError)
      return NextResponse.json(
        { error: 'Failed to check deletion status' },
        { status: 500 }
      )
    }

    // 3. Get deletion summary
    const { data: summaryResult, error: summaryError } = await supabaseAdmin
      .rpc('get_deletion_summary', { p_user_id: authUser.id })

    if (summaryError) {
      console.error('Summary error:', summaryError)
      return NextResponse.json(
        { error: 'Failed to get deletion summary' },
        { status: 500 }
      )
    }

    // 4. Return combined result
    return NextResponse.json({
      canDelete: blockersResult.can_delete,
      blockers: blockersResult.blockers,
      summary: summaryResult,
    })
  } catch (error) {
    console.error('GET /api/account/preflight error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
