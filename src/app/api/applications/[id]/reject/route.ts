/**
 * Reject Application API
 * PATCH /api/applications/[id]/reject - Reject an application (task owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { authenticateRequest } from '@/lib/auth/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;

    // Authenticate request - supports both Supabase session and notification tokens
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body for optional rejection reason
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Use admin client for database operations
    const adminClient = createAdminClient();

    // Get application with task details
    const { data: application, error: appError } = await adminClient
      .from('applications')
      .select(`
        id,
        task_id,
        professional_id,
        status,
        task:tasks (
          id,
          customer_id,
          title
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Type assertion for nested task object
    const task = Array.isArray(application.task) ? application.task[0] : application.task;

    // Verify user is the task owner
    if (task?.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only task owner can reject applications' },
        { status: 403 }
      );
    }

    // Verify application is pending
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot reject application with status: ${application.status}` },
        { status: 400 }
      );
    }

    // Update application status to rejected
    const { error: rejectError } = await adminClient
      .from('applications')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        rejection_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (rejectError) {
      console.error('[Applications] Error rejecting application:', rejectError);
      return NextResponse.json(
        { error: 'Failed to reject application' },
        { status: 500 }
      );
    }

    // TODO: Send notification to professional (Telegram if connected)
    console.log('[Applications] Application rejected:', {
      applicationId,
      taskId: application.task_id,
      taskTitle: task?.title,
      professionalId: application.professional_id,
      reason: reason || 'No reason provided'
    });

    return NextResponse.json({
      success: true,
      message: 'Application rejected successfully'
    });

  } catch (error) {
    console.error('[Applications] Reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
