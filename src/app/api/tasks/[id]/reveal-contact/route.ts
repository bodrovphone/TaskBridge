/**
 * POST /api/tasks/[id]/reveal-contact
 *
 * Cold-start initiative (April 2026): lets any authenticated non-owner viewer
 * reveal the customer's full name + phone on a task. The act of revealing is
 * recorded in `task_interest_clicks` (idempotent per viewer per task) so we can
 * compare interest-clicks vs applications and validate the apply-gate hypothesis.
 *
 * Eligibility:
 *   - Caller is authenticated.
 *   - Caller is not the task owner.
 *   - Task has `contact_sharing_consent_at` set (created after consent rollout).
 *
 * Returns 200 with { fullName, phone } on success.
 */
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/api-auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params

  const viewer = await authenticateRequest(request)
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, customer_id, contact_sharing_consent_at, status')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.customer_id === viewer.id) {
    return NextResponse.json(
      { error: 'Owner cannot reveal own contact' },
      { status: 403 }
    )
  }

  if (!task.contact_sharing_consent_at) {
    return NextResponse.json(
      { error: 'Contact sharing not enabled for this task', code: 'CONSENT_MISSING' },
      { status: 403 }
    )
  }

  const { data: customer, error: customerError } = await supabase
    .from('users')
    .select('full_name, phone')
    .eq('id', task.customer_id)
    .single()

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Idempotent insert — unique(task_id, viewer_id) means a repeat click is a no-op.
  await supabase
    .from('task_interest_clicks')
    .upsert(
      { task_id: taskId, viewer_id: viewer.id },
      { onConflict: 'task_id,viewer_id', ignoreDuplicates: true }
    )

  return NextResponse.json({
    fullName: customer.full_name,
    phone: customer.phone,
  })
}
