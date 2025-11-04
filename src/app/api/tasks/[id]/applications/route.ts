/**
 * Task Applications API
 * GET /api/tasks/[id]/applications - Get applications for a task (task owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get task and verify ownership
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, customer_id, title, status')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify user is the task owner
    if (task.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view applications for your own tasks' },
        { status: 403 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('applications')
      .select(`
        id,
        created_at,
        updated_at,
        proposed_price_bgn,
        estimated_duration_hours,
        message,
        availability_date,
        status,
        responded_at,
        rejection_reason,
        professional:users!applications_professional_id_fkey (
          id,
          full_name,
          avatar_url,
          bio,
          hourly_rate_bgn,
          rating_average,
          rating_count,
          completed_tasks_count,
          city,
          skills
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: applications, error: queryError } = await query;

    if (queryError) {
      console.error('[Task Applications] GET error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || [],
      taskId,
      taskTitle: task.title,
      taskStatus: task.status
    });

  } catch (error) {
    console.error('[Task Applications] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
