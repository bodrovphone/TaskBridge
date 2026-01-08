import { NextRequest, NextResponse } from 'next/server'
import { validateNotificationAutoLoginToken } from '@/lib/auth/notification-auto-login'
import { createAdminClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/server/domain/user/user.types'

/**
 * Transform raw database record to UserProfile format
 * This matches the transformation in UserRepository.toDomain()
 */
function transformToUserProfile(raw: any): UserProfile {
  return {
    id: raw.id,
    slug: raw.slug || null,
    email: raw.email,
    fullName: raw.full_name,
    phoneNumber: raw.phone,
    city: raw.city,
    country: raw.country || 'Bulgaria',
    isPhoneVerified: raw.is_phone_verified,
    isEmailVerified: raw.is_email_verified,
    phoneVerifiedAt: raw.phone_verified_at ? new Date(raw.phone_verified_at) : null,
    emailVerifiedAt: raw.email_verified_at ? new Date(raw.email_verified_at) : null,
    totalSpentBgn: raw.total_spent_bgn ? parseFloat(raw.total_spent_bgn) : 0,
    professionalTitle: raw.professional_title,
    vatNumber: raw.vat_number,
    isVatVerified: raw.is_vat_verified,
    vatVerifiedAt: raw.vat_verified_at ? new Date(raw.vat_verified_at) : null,
    companyName: raw.company_name,
    yearsExperience: raw.years_experience,
    hourlyRateBgn: raw.hourly_rate_bgn ? parseFloat(raw.hourly_rate_bgn) : null,
    serviceCategories: raw.service_categories || [],
    availabilityStatus: raw.availability_status || 'available',
    serviceAreaCities: raw.service_area_cities || [],
    totalEarningsBgn: raw.total_earnings_bgn ? parseFloat(raw.total_earnings_bgn) : 0,
    profileViews: raw.profile_views || 0,
    gallery: raw.portfolio || [],
    services: raw.services || [],
    tasksCompleted: raw.tasks_completed || 0,
    averageRating: raw.average_rating ? parseFloat(raw.average_rating) : null,
    totalReviews: raw.total_reviews || 0,
    acceptanceRate: raw.acceptance_rate ? parseFloat(raw.acceptance_rate) : null,
    preferredLanguage: raw.preferred_language || 'bg',
    preferredContact: raw.preferred_contact || 'email',
    bio: raw.bio,
    avatarUrl: raw.avatar_url,
    notificationPreferences: raw.notification_preferences || {
      email: true,
      sms: true,
      push: true,
      telegram: true,
      taskUpdates: true,
      weeklyDigest: false,
      marketing: false
    },
    privacySettings: raw.privacy_settings || {
      profileVisible: true,
      showPhone: false,
      showEmail: false,
      showContactInfo: true
    },
    telegramId: raw.telegram_id,
    telegramUsername: raw.telegram_username,
    telegramFirstName: raw.telegram_first_name,
    telegramLastName: raw.telegram_last_name,
    telegramPhotoUrl: raw.telegram_photo_url,
    preferredNotificationChannel: raw.preferred_notification_channel,
    isBanned: raw.is_banned || false,
    banReason: raw.ban_reason,
    bannedAt: raw.banned_at ? new Date(raw.banned_at) : null,
    lastActiveAt: raw.last_active_at ? new Date(raw.last_active_at) : null,
    registrationIntent: raw.registration_intent,
    profileReminderSentAt: raw.profile_reminder_sent_at ? new Date(raw.profile_reminder_sent_at) : null,
    lastTaskNotificationAt: raw.last_task_notification_at ? new Date(raw.last_task_notification_at) : null,
    isEarlyAdopter: raw.is_early_adopter || false,
    earlyAdopterCategories: raw.early_adopter_categories || [],
    isTopProfessional: raw.is_top_professional || false,
    topProfessionalUntil: raw.top_professional_until ? new Date(raw.top_professional_until) : null,
    topProfessionalTasksCount: raw.top_professional_tasks_count || 0,
    isFeatured: raw.is_featured || false,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  }
}

/**
 * API endpoint to validate a notification session token and return user session data
 * This is called by the useAuth hook when it detects a notificationSession parameter
 *
 * Flow:
 * 1. Validate the notification session token
 * 2. Get user data from database
 * 3. Generate a Supabase session for the user
 * 4. Return session data (access_token, refresh_token, user)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    console.log('🔐 Validating notification session token...')

    // Validate the notification session token
    const tokenData = await validateNotificationAutoLoginToken(token)

    if (!tokenData) {
      console.error('❌ Invalid or expired token')
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    console.log('✅ Token valid for user:', tokenData.userId)

    // Get user data using admin client
    const supabaseAdmin = createAdminClient()

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', tokenData.userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('📧 User found:', user.email)

    // Transform raw database record to UserProfile format
    // This ensures camelCase fields match what the frontend expects
    const transformedUser = transformToUserProfile(user)

    // Return user data and the original notification token
    // The client will use this token for authenticated API requests
    // API routes will validate this token as an alternative to Supabase auth
    return NextResponse.json({
      success: true,
      user: transformedUser,
      notificationToken: token // Return the token to use for API authentication
    })

  } catch (error) {
    console.error('❌ Notification session validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
