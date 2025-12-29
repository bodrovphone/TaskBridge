/**
 * User Repository
 * Handles data persistence with Supabase
 * Implements repository pattern for clean architecture
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { User } from '@/server/domain/user/user.entity'
import { UserProfile } from '@/server/domain/user/user.types'
import { generateSlug, makeSlugUnique } from '@/lib/utils/transliterate'
import { getCategoryLabelForSlug } from '@/features/categories'

export class UserRepository {
  /**
   * Generate a unique slug for a professional
   * Uses name + translated category + city, with collision detection
   * Category is translated to Bulgarian for consistency
   */
  async generateUniqueSlug(
    fullName: string | null,
    primaryCategory: string | null,
    city: string | null
  ): Promise<string | null> {
    if (!fullName) {
      return null
    }

    // Translate category to Bulgarian for consistent slug
    // e.g., 'plumber' → 'Водопроводчик' → 'vodoprovodchik'
    const translatedCategory = primaryCategory
      ? getCategoryLabelForSlug(primaryCategory, 'bg')
      : null

    // Generate base slug from name + translated category + city
    const slugBase = [fullName, translatedCategory, city].filter(Boolean).join(' ').trim()
    const baseSlug = generateSlug(slugBase, 80)

    if (!baseSlug) {
      return null
    }

    // Check for existing slugs with same prefix
    const supabase = createAdminClient()
    const { data: existingSlugs } = await supabase
      .from('users')
      .select('slug')
      .like('slug', `${baseSlug}%`)

    const slugList = (existingSlugs || []).map(s => s.slug).filter(Boolean) as string[]
    return makeSlugUnique(baseSlug, slugList)
  }
  /**
   * Find user by Supabase auth ID
   */
  async findByAuthId(authId: string): Promise<User | null> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authId)
        .single()

      if (error || !data) {
        return null
      }

      return this.toDomain(data)
    } catch (error) {
      console.error('Error finding user by auth ID:', error)
      return null
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        return null
      }

      return this.toDomain(data)
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  /**
   * Check if user has a complete professional profile
   * Requirements: professional_title, bio (>= 20 chars), service_categories (>= 1)
   */
  private hasProfessionalProfile(user: User): boolean {
    const hasTitle = user.professionalTitle && user.professionalTitle.length >= 3
    const hasBio = user.bio && user.bio.length >= 20
    const hasCategories = user.serviceCategories && user.serviceCategories.length > 0
    return !!(hasTitle && hasBio && hasCategories)
  }

  /**
   * Create new user profile
   * Note: Slug is NOT generated on creation - only when professional profile is complete
   */
  async create(user: User): Promise<User> {
    const supabase = await createClient()

    const persistenceData = this.toPersistence(user)

    const { data, error } = await supabase
      .from('users')
      .insert(persistenceData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return this.toDomain(data)
  }

  /**
   * Update existing user profile
   * Generates slug only when user completes their professional profile
   */
  async update(user: User): Promise<User> {
    const supabase = await createClient()

    const persistenceData = this.toPersistence(user)

    // Only generate slug when professional profile is complete
    if (this.hasProfessionalProfile(user)) {
      try {
        const primaryCategory = user.serviceCategories?.[0] || null
        const slug = await this.generateUniqueSlug(user.fullName, primaryCategory, user.city)
        if (slug) {
          persistenceData.slug = slug
        }
      } catch (slugError) {
        // If slug generation fails, continue without slug (will use UUID)
        console.warn('Slug generation failed, continuing without slug:', slugError)
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(persistenceData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return this.toDomain(data)
  }

  /**
   * Delete user profile
   */
  async delete(authId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', authId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Search professionals by city and service categories
   * Professionals are identified by having professional_title, bio, and service_categories
   */
  async searchProfessionals(filters: {
    city?: string
    serviceCategories?: string[]
    minRating?: number
  }): Promise<User[]> {
    const supabase = await createClient()

    // Professionals must have: title, bio, service_categories
    let query = supabase
      .from('users')
      .select('*')
      .not('professional_title', 'is', null)
      .not('bio', 'is', null)
      .not('service_categories', 'is', null)
      .eq('is_email_verified', true)
      .eq('is_phone_verified', true)
      .eq('is_banned', false)

    if (filters.city) {
      query = query.eq('city', filters.city)
    }

    if (filters.serviceCategories && filters.serviceCategories.length > 0) {
      query = query.overlaps('service_categories', filters.serviceCategories)
    }

    if (filters.minRating) {
      query = query.gte('average_rating', filters.minRating)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to search professionals: ${error.message}`)
    }

    return (data || []).map(record => this.toDomain(record))
  }

  // ============================================
  // PRIVATE MAPPERS
  // ============================================

  /**
   * Convert database record to domain entity
   */
  private toDomain(raw: any): User {
    const profile: UserProfile = {
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

      // Customer-specific
      totalSpentBgn: raw.total_spent_bgn ? parseFloat(raw.total_spent_bgn) : 0,

      // Professional info
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
      // HIDDEN: Not displayed anywhere - commented out to reduce data transfer
      // paymentMethods: raw.payment_methods || ['cash', 'bank_transfer'],
      // languages: raw.languages || [raw.preferred_language || 'bg'],
      // weekdayHours: raw.weekday_hours || { start: '08:00', end: '18:00' },
      // weekendHours: raw.weekend_hours || { start: '09:00', end: '14:00' },
      totalEarningsBgn: raw.total_earnings_bgn ? parseFloat(raw.total_earnings_bgn) : 0,
      profileViews: raw.profile_views || 0,
      gallery: raw.portfolio || [],
      services: raw.services || [],

      // Statistics
      tasksCompleted: raw.tasks_completed || 0,
      averageRating: raw.average_rating ? parseFloat(raw.average_rating) : null,
      totalReviews: raw.total_reviews || 0,
      // HIDDEN: Hardcoded on detail page
      // responseTimeHours: raw.response_time_hours ? parseFloat(raw.response_time_hours) : null,
      acceptanceRate: raw.acceptance_rate ? parseFloat(raw.acceptance_rate) : null,

      // Settings
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

      // Telegram Integration
      telegramId: raw.telegram_id,
      telegramUsername: raw.telegram_username,
      telegramFirstName: raw.telegram_first_name,
      telegramLastName: raw.telegram_last_name,
      telegramPhotoUrl: raw.telegram_photo_url,
      preferredNotificationChannel: raw.preferred_notification_channel,

      // Status
      isBanned: raw.is_banned || false,
      banReason: raw.ban_reason,
      bannedAt: raw.banned_at ? new Date(raw.banned_at) : null,
      lastActiveAt: raw.last_active_at ? new Date(raw.last_active_at) : null,

      // Registration & Onboarding
      registrationIntent: raw.registration_intent,
      profileReminderSentAt: raw.profile_reminder_sent_at ? new Date(raw.profile_reminder_sent_at) : null,
      lastTaskNotificationAt: raw.last_task_notification_at ? new Date(raw.last_task_notification_at) : null,

      // Badge fields
      isEarlyAdopter: raw.is_early_adopter || false,
      earlyAdopterCategories: raw.early_adopter_categories || [],
      isTopProfessional: raw.is_top_professional || false,
      topProfessionalUntil: raw.top_professional_until ? new Date(raw.top_professional_until) : null,
      topProfessionalTasksCount: raw.top_professional_tasks_count || 0,
      isFeatured: raw.is_featured || false,

      // Timestamps
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    }

    return User.fromProfile(profile)
  }

  /**
   * Convert domain entity to database record
   * Note: slug is generated separately in create/update methods with collision detection
   */
  private toPersistence(user: User): any {
    return {
      id: user.id,
      // slug is set separately in create/update with collision detection
      email: user.email,
      full_name: user.fullName,
      phone: user.phoneNumber,
      city: user.city,
      country: user.country,
      is_phone_verified: user.isPhoneVerified,
      is_email_verified: user.isEmailVerified,
      phone_verified_at: user.phoneVerifiedAt?.toISOString(),
      email_verified_at: user.emailVerifiedAt?.toISOString(),

      // Customer-specific
      total_spent_bgn: user.totalSpentBgn,

      // Professional info
      professional_title: user.professionalTitle,
      vat_number: user.vatNumber,
      is_vat_verified: user.isVatVerified,
      vat_verified_at: user.vatVerifiedAt?.toISOString(),
      company_name: user.companyName,
      years_experience: user.yearsExperience,
      hourly_rate_bgn: user.hourlyRateBgn,
      service_categories: user.serviceCategories,
      availability_status: user.availabilityStatus,
      service_area_cities: user.serviceAreaCities,
      // HIDDEN: Not displayed anywhere
      // payment_methods: user.paymentMethods,
      // languages: user.languages,
      // weekday_hours: user.weekdayHours,
      // weekend_hours: user.weekendHours,
      total_earnings_bgn: user.totalEarningsBgn,
      profile_views: user.profileViews,
      portfolio: user.gallery,
      services: user.services,

      // Statistics
      tasks_completed: user.tasksCompleted,
      average_rating: user.averageRating,
      total_reviews: user.totalReviews,
      // HIDDEN: Hardcoded on detail page
      // response_time_hours: user.responseTimeHours,
      acceptance_rate: user.acceptanceRate,

      // Settings
      preferred_language: user.preferredLanguage,
      preferred_contact: user.preferredContact,
      bio: user.bio,
      avatar_url: user.avatarUrl,
      notification_preferences: user.notificationPreferences,
      privacy_settings: user.privacySettings,

      // Telegram Integration
      telegram_id: user.telegramId,
      telegram_username: user.telegramUsername,
      telegram_first_name: user.telegramFirstName,
      telegram_last_name: user.telegramLastName,
      telegram_photo_url: user.telegramPhotoUrl,
      preferred_notification_channel: user.preferredNotificationChannel,

      // Status
      is_banned: user.isBanned,
      ban_reason: user.banReason,
      banned_at: user.bannedAt?.toISOString(),
      last_active_at: user.lastActiveAt?.toISOString(),

      // Registration & Onboarding
      registration_intent: user.registrationIntent,
      profile_reminder_sent_at: user.profileReminderSentAt?.toISOString(),
      last_task_notification_at: user.lastTaskNotificationAt?.toISOString(),

      // Timestamps
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }
  }
}
