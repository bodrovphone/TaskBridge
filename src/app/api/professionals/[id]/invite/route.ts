import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendTemplatedNotification } from '@/lib/services/telegram-notification'
import { generateNotificationAutoLoginUrl } from '@/lib/auth/notification-auto-login'
import { NextResponse } from 'next/server'
import { getCategoryLabelBySlug } from '@/features/categories'
import i18next from 'i18next'
import { en } from '@/lib/intl/en'
import { bg } from '@/lib/intl/bg'
import { ru } from '@/lib/intl/ru'

// Initialize i18next for server-side category translation
const i18nInstance = i18next.createInstance()
i18nInstance.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    bg: { translation: bg },
    ru: { translation: ru },
  },
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use regular client for auth
    const supabase = await createClient()

    // Use admin client for data access (bypass RLS)
    const adminClient = createAdminClient()

    const { id: professionalId } = await params
    const { taskId } = await request.json()

    // Get current user (customer)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task details (use admin client)
    const { data: task, error: taskError } = await adminClient
      .from('tasks')
      .select('id, title, category, customer_id, status')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify customer owns the task
    if (task.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only invite professionals to your own tasks' },
        { status: 403 }
      )
    }

    // Verify task is open
    if (task.status !== 'open') {
      return NextResponse.json(
        { error: 'Can only invite professionals to open tasks' },
        { status: 400 }
      )
    }

    // Prevent self-invitation
    if (professionalId === user.id) {
      return NextResponse.json(
        { error: 'You cannot invite yourself to your own task' },
        { status: 400 }
      )
    }

    // Get professional details (use admin client)
    const { data: professional, error: professionalError } = await adminClient
      .from('users')
      .select('id, full_name')
      .eq('id', professionalId)
      .single()

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    // Get customer name (use admin client)
    const { data: customer } = await adminClient
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const customerName = customer?.full_name || 'A customer'

    // Check for duplicate invitation (use admin client)
    const { data: existingInvitation } = await adminClient
      .from('notifications')
      .select('id')
      .eq('user_id', professionalId)
      .eq('type', 'task_invitation')
      .eq('metadata->>taskId', taskId)
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Professional already invited to this task' },
        { status: 400 }
      )
    }

    // Get professional's locale preference (use admin client)
    const { data: professionalData } = await adminClient
      .from('users')
      .select('preferred_language')
      .eq('id', professionalId)
      .single()

    const userLocale = professionalData?.preferred_language || 'bg'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

    // Generate action URL with locale
    let actionUrl = `/tasks/${task.id}`
    if (!actionUrl.startsWith(`/${userLocale}/`)) {
      actionUrl = `/${userLocale}${actionUrl}`
    }

    // Generate auto-login URL for in-app notification
    let finalActionUrl = actionUrl
    try {
      finalActionUrl = await generateNotificationAutoLoginUrl(
        professionalId,
        'telegram',
        actionUrl,
        baseUrl
      )
    } catch (error) {
      console.error('Failed to generate auto-login URL:', error)
      // Fall back to original URL if generation fails
    }

    // Create notification with magic link (use admin client)
    const { error: notificationError } = await adminClient
      .from('notifications')
      .insert({
        user_id: professionalId,
        type: 'task_invitation',
        title: 'New Task Invitation',
        message: `${customerName} has invited you to apply for their task`,
        metadata: {
          taskId: task.id,
          customerId: user.id,
          customerName,
          taskTitle: task.title,
          taskCategory: task.category,
        },
        action_url: finalActionUrl,
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    // Send Telegram notification with magic link
    try {
      // Generate auto-login URL for Telegram
      const telegramAutoLoginUrl = await generateNotificationAutoLoginUrl(
        professionalId,
        'telegram',
        actionUrl,
        baseUrl
      )

      // Translate category to recipient's language
      const t = i18nInstance.getFixedT(userLocale)
      const translatedCategory = getCategoryLabelBySlug(task.category, t)

      await sendTemplatedNotification(
        professionalId,
        'taskInvitation',
        userLocale,
        task.title,
        customerName,
        translatedCategory,
        telegramAutoLoginUrl
      )
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError)
      // Don't fail the request if Telegram fails
    }

    return NextResponse.json({
      success: true,
      message: 'Professional invited successfully',
    })
  } catch (error) {
    console.error('Error inviting professional:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
