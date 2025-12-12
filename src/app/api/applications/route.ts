/**
 * Applications API
 * POST /api/applications - Submit new application
 * GET /api/applications - Get user's applications (professional side)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/services/notification-service';
import { authenticateRequest } from '@/lib/auth/api-auth';

/**
 * POST - Submit new application to a task
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (supports both Supabase session and notification token)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to bypass RLS since we've already authenticated the user
    // This is necessary for notification token auth (magic links) where there's
    // no Supabase session, so auth.uid() in RLS policies would return NULL
    const supabase = createAdminClient();

    const body = await request.json();
    const {
      taskId,
      proposedPrice,
      estimatedDurationHours,
      message,
      availabilityDate
    } = body;

    // Validate required fields
    if (!taskId || typeof proposedPrice !== 'number' || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, proposedPrice, message' },
        { status: 400 }
      );
    }

    // Validate proposed price is not negative (0 is allowed for volunteering)
    if (proposedPrice < 0) {
      return NextResponse.json(
        { error: 'Proposed price cannot be negative' },
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

    // Clean up professional's old rejected/withdrawn applications (30+ days)
    // This keeps the database lean without needing a cron job
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabase
        .from('applications')
        .delete()
        .eq('professional_id', user.id)
        .in('status', ['rejected', 'withdrawn'])
        .lt('updated_at', thirtyDaysAgo.toISOString());
    } catch {
      // Fail silently - cleanup is best-effort and non-critical
    }

    // Get professional's name for notification
    const { data: professional } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Send notification to task owner (Telegram + in-app)
    await createNotification({
      userId: task.customer_id,
      type: 'application_received',
      templateData: {
        taskId: task.id, // Required for email link
        applicationId: application.id, // Required for email link
        professionalId: user.id, // Required for email link to professional profile
        professionalName: professional?.full_name || 'Someone',
        taskTitle: task.title,
      },
      metadata: {
        taskId: task.id,
        applicationId: application.id,
        professionalId: user.id,
        professionalName: professional?.full_name,
        proposedPrice: proposedPrice,
      },
      actionUrl: `/tasks/${task.id}?application=${application.id}`,
      deliveryChannel: 'both', // Telegram + in-app (customer gets notified immediately)
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
    // Check authentication (supports both Supabase session and notification token)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Use admin client to bypass RLS and fetch customer data
    const adminClient = createAdminClient();

    // Build query
    let query = adminClient
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
        accepted_at,
        rejection_reason,
        withdrawn_at,
        withdrawal_reason,
        shared_contact_info,
        task:tasks (
          id,
          title,
          description,
          category,
          budget_min_bgn,
          budget_max_bgn,
          city,
          neighborhood,
          status,
          images,
          created_at,
          customer:users!tasks_customer_id_fkey (
            id,
            full_name,
            avatar_url,
            phone,
            email
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
