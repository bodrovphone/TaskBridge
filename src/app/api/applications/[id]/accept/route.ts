/**
 * Accept Application API
 * PATCH /api/applications/[id]/accept - Accept an application (task owner only)
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

    // Get application with task details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        task_id,
        professional_id,
        status,
        task:tasks (
          id,
          customer_id,
          title,
          status
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
        { error: 'Forbidden: Only task owner can accept applications' },
        { status: 403 }
      );
    }

    // Verify application is pending
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot accept application with status: ${application.status}` },
        { status: 400 }
      );
    }

    // Verify task is open
    if (task?.status !== 'open') {
      return NextResponse.json(
        { error: 'Task is not open for acceptance' },
        { status: 400 }
      );
    }

    // Start transaction: Accept application and update task
    // 1. Update application status to accepted
    const { error: acceptError } = await supabase
      .from('applications')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (acceptError) {
      console.error('[Applications] Error accepting application:', acceptError);
      return NextResponse.json(
        { error: 'Failed to accept application' },
        { status: 500 }
      );
    }

    // 2. Update task: assign to professional and mark as in progress
    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        selected_professional_id: application.professional_id,
        accepted_application_id: applicationId,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.task_id);

    if (taskError) {
      console.error('[Applications] Error updating task:', taskError);
      // Rollback application acceptance
      await supabase
        .from('applications')
        .update({
          status: 'pending',
          responded_at: null
        })
        .eq('id', applicationId);

      return NextResponse.json(
        { error: 'Failed to assign task' },
        { status: 500 }
      );
    }

    // 3. Reject all other pending applications for this task
    const { error: rejectError } = await supabase
      .from('applications')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        rejection_reason: 'Another professional was selected',
        updated_at: new Date().toISOString()
      })
      .eq('task_id', application.task_id)
      .eq('status', 'pending')
      .neq('id', applicationId);

    if (rejectError) {
      console.error('[Applications] Error rejecting other applications:', rejectError);
      // Don't fail the request - other applications can be handled manually
    }

    // TODO: Send notifications
    // - Notify accepted professional (Telegram if connected)
    // - Notify rejected professionals (Telegram if connected)
    console.log('[Applications] Application accepted:', {
      applicationId,
      taskId: application.task_id,
      taskTitle: task?.title,
      professionalId: application.professional_id,
      customerId: task?.customer_id
    });

    return NextResponse.json({
      success: true,
      message: 'Application accepted successfully'
    });

  } catch (error) {
    console.error('[Applications] Accept error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
