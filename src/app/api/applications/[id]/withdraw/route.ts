/**
 * Withdraw Application API
 * PATCH /api/applications/[id]/withdraw - Withdraw an application (professional only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body for optional withdrawal reason
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Get application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        task_id,
        professional_id,
        status,
        task:tasks (
          id,
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

    // Verify user is the professional who submitted the application
    if (application.professional_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only withdraw your own applications' },
        { status: 403 }
      );
    }

    // Verify application is pending
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot withdraw application with status: ${application.status}` },
        { status: 400 }
      );
    }

    // Update application status to withdrawn
    const { error: withdrawError } = await supabase
      .from('applications')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
        withdrawal_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (withdrawError) {
      console.error('[Applications] Error withdrawing application:', withdrawError);
      return NextResponse.json(
        { error: 'Failed to withdraw application' },
        { status: 500 }
      );
    }

    // TODO: Update task applications count (decrement) - needs RPC function or trigger

    console.log('[Applications] Application withdrawn:', {
      applicationId,
      taskId: application.task_id,
      taskTitle: task?.title,
      professionalId: application.professional_id,
      reason: reason || 'No reason provided'
    });

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('[Applications] Withdraw error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
