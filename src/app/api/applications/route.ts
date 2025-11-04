/**
 * Applications API
 * POST /api/applications - Submit new application
 * GET /api/applications - Get user's applications (professional side)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST - Submit new application to a task
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      taskId,
      proposedPrice,
      estimatedDurationHours,
      message,
      availabilityDate
    } = body;

    // Validate required fields
    if (!taskId || !proposedPrice || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, proposedPrice, message' },
        { status: 400 }
      );
    }

    // Validate proposed price is positive
    if (proposedPrice <= 0) {
      return NextResponse.json(
        { error: 'Proposed price must be greater than 0' },
        { status: 400 }
      );
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, customer_id, status, title')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Validate user is not the task owner
    if (task.customer_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot apply to your own task' },
        { status: 403 }
      );
    }

    // Validate task is open for applications
    if (task.status !== 'open') {
      return NextResponse.json(
        { error: 'Task is not accepting applications' },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('task_id', taskId)
      .eq('professional_id', user.id)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied to this task' },
        { status: 409 }
      );
    }

    // Create application
    const { data: application, error: createError } = await supabase
      .from('applications')
      .insert({
        task_id: taskId,
        professional_id: user.id,
        proposed_price_bgn: proposedPrice,
        estimated_duration_hours: estimatedDurationHours || null,
        message: message,
        availability_date: availabilityDate || null,
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error('[Applications] Error creating application:', createError);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    // Update task applications count
    const { error: updateError } = await supabase.rpc('increment_applications_count', {
      task_id: taskId
    });

    if (updateError) {
      console.error('[Applications] Error updating task count:', updateError);
      // Don't fail the request - count can be fixed later
    }

    // TODO: Send notification to task owner (Telegram if connected)
    console.log('[Applications] New application:', {
      applicationId: application.id,
      taskId,
      taskTitle: task.title,
      professionalId: user.id,
      customerId: task.customer_id
    });

    return NextResponse.json({
      success: true,
      application
    }, { status: 201 });

  } catch (error) {
    console.error('[Applications] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get user's applications (professional view)
 * Query params: ?status=pending|accepted|rejected|withdrawn
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
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
        withdrawn_at,
        withdrawal_reason,
        task:tasks (
          id,
          title,
          description,
          category,
          budget_min,
          budget_max,
          city,
          neighborhood,
          status,
          created_at,
          customer:users!tasks_customer_id_fkey (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: applications, error: queryError } = await query;

    if (queryError) {
      console.error('[Applications] GET error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || []
    });

  } catch (error) {
    console.error('[Applications] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
