/**
 * E2E Cleanup API Route
 *
 * Deletes test user accounts and all related data from Supabase.
 * Restricted to requests with a valid E2E_CLEANUP_SECRET header.
 * Only accepts emails matching the +e2e+ pattern as a safety check.
 *
 * POST /api/internal/e2e-cleanup
 * Headers: { "x-cleanup-secret": "<E2E_CLEANUP_SECRET>" }
 * Body: { "emails": ["bodrovphone+e2e+pro@gmail.com"] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isE2ETestEmail } from '@/lib/utils/e2e-detection'
import { revalidatePath } from 'next/cache'

const LOCALES = ['en', 'bg', 'ru', 'ua']
const PATHS_TO_REVALIDATE = ['/', '/professionals', '/browse-tasks']

interface CleanupResult {
  email: string
  deleted: boolean
  error?: string
  details?: Record<string, number>
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const secret = request.headers.get('x-cleanup-secret')
    const expectedSecret = process.env.E2E_CLEANUP_SECRET

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Parse body
    const { emails } = await request.json()

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'emails array is required' },
        { status: 400 }
      )
    }

    // 3. Safety check: only allow +e2e+ emails
    const unsafeEmails = emails.filter((e: string) => !isE2ETestEmail(e))
    if (unsafeEmails.length > 0) {
      return NextResponse.json(
        { error: `Refused: emails must contain +e2e+ pattern. Rejected: ${unsafeEmails.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const results: CleanupResult[] = []

    // 4. Process each email
    for (const email of emails) {
      const result = await cleanupUser(supabase, email)
      results.push(result)
    }

    // 5. Revalidate cached pages
    for (const locale of LOCALES) {
      for (const path of PATHS_TO_REVALIDATE) {
        try {
          revalidatePath(`/${locale}${path}`)
        } catch {
          // Non-critical — pages will refresh on next ISR cycle
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('[E2E Cleanup] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function cleanupUser(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
): Promise<CleanupResult> {
  const details: Record<string, number> = {}

  try {
    // Find user in our DB by email
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, avatar_url')
      .eq('email', email)
      .maybeSingle()

    // Find user in Supabase Auth
    const { data: authList } = await supabase.auth.admin.listUsers()
    const authUser = authList?.users?.find(u => u.email === email)

    if (!dbUser && !authUser) {
      return { email, deleted: false, error: 'User not found' }
    }

    const userId = dbUser?.id

    // Delete DB data if user exists in our tables
    if (userId) {
      // notification_logs (may not have FK cascade)
      await supabase
        .from('notification_logs')
        .delete()
        .eq('user_id', userId)

      // reviews (SET NULL policy, need explicit delete)
      await supabase
        .from('reviews')
        .delete()
        .eq('reviewer_id', userId)
      await supabase
        .from('reviews')
        .delete()
        .eq('reviewee_id', userId)

      // deletion_audit_log
      await supabase
        .from('deletion_audit_log')
        .delete()
        .eq('deleted_user_id', userId)

      // Delete user row — cascades: tasks, applications, messages, notifications, safety_reports
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      if (deleteError) {
        return { email, deleted: false, error: `DB delete failed: ${deleteError.message}`, details }
      }
      details.userDeleted = 1

      // Clean up avatar from storage
      if (dbUser.avatar_url) {
        try {
          const path = new URL(dbUser.avatar_url).pathname
          const storagePath = path.split('/avatars/').pop()
          if (storagePath) {
            await supabase.storage.from('avatars').remove([storagePath])
            details.avatarDeleted = 1
          }
        } catch {
          // Non-critical
        }
      }
    }

    // Delete from Supabase Auth
    if (authUser) {
      const { error: authError } = await supabase.auth.admin.deleteUser(authUser.id)
      if (authError) {
        return { email, deleted: false, error: `Auth delete failed: ${authError.message}`, details }
      }
      details.authDeleted = 1
    }

    return { email, deleted: true, details }
  } catch (error) {
    return {
      email,
      deleted: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details,
    }
  }
}
