/**
 * User Repository
 * Handles data persistence with Supabase
 * Implements repository pattern for clean architecture
 */

import { createClient } from '@/lib/supabase/server'
import { User } from '@/server/domain/user/user.entity'
import { UserProfile } from '@/server/domain/user/user.types'

export class UserRepository {
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
   * Create new user profile
   */
  async create(user: User): Promise<User> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .insert(this.toPersistence(user))
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return this.toDomain(data)
  }

  /**
   * Update existing user profile
   */
  async update(user: User): Promise<User> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .update(this.toPersistence(user))
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
   * Find users by user type
   */
  async findByUserType(userType: 'customer' | 'professional' | 'both'): Promise<User[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', userType)

    if (error) {
      throw new Error(`Failed to find users by type: ${error.message}`)
    }

    return (data || []).map(record => this.toDomain(record))
  }

  /**
   * Search professionals by city and service categories
   */
  async searchProfessionals(filters: {
    city?: string
    serviceCategories?: string[]
    minRating?: number
  }): Promise<User[]> {
    const supabase = await createClient()

    let query = supabase
      .from('users')
      .select('*')
      .in('user_type', ['professional', 'both'])
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
      email: raw.email,
      fullName: raw.full_name,
      phoneNumber: raw.phone,
      userType: raw.user_type,
      city: raw.city,
      neighborhood: raw.neighborhood,
      country: raw.country || 'Bulgaria',
      isPhoneVerified: raw.is_phone_verified,
      isEmailVerified: raw.is_email_verified,
      phoneVerifiedAt: raw.phone_verified_at ? new Date(raw.phone_verified_at) : null,
      emailVerifiedAt: raw.email_verified_at ? new Date(raw.email_verified_at) : null,
      vatNumber: raw.vat_number,
      isVatVerified: raw.is_vat_verified,
      vatVerifiedAt: raw.vat_verified_at ? new Date(raw.vat_verified_at) : null,
      companyName: raw.company_name,
      yearsExperience: raw.years_experience,
      hourlyRateBgn: raw.hourly_rate_bgn ? parseFloat(raw.hourly_rate_bgn) : null,
      serviceCategories: raw.service_categories || [],
      tasksCompleted: raw.tasks_completed || 0,
      averageRating: raw.average_rating ? parseFloat(raw.average_rating) : null,
      totalReviews: raw.total_reviews || 0,
      responseTimeHours: raw.response_time_hours ? parseFloat(raw.response_time_hours) : null,
      acceptanceRate: raw.acceptance_rate ? parseFloat(raw.acceptance_rate) : null,
      preferredLanguage: raw.preferred_language || 'bg',
      preferredContact: raw.preferred_contact || 'email',
      bio: raw.bio,
      avatarUrl: raw.avatar_url,
      isBanned: raw.is_banned || false,
      banReason: raw.ban_reason,
      bannedAt: raw.banned_at ? new Date(raw.banned_at) : null,
      lastActiveAt: raw.last_active_at ? new Date(raw.last_active_at) : null,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    }

    return User.fromProfile(profile)
  }

  /**
   * Convert domain entity to database record
   */
  private toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phoneNumber,
      user_type: user.userType,
      city: user.city,
      neighborhood: user.neighborhood,
      country: user.country,
      is_phone_verified: user.isPhoneVerified,
      is_email_verified: user.isEmailVerified,
      phone_verified_at: user.phoneVerifiedAt?.toISOString(),
      email_verified_at: user.emailVerifiedAt?.toISOString(),
      vat_number: user.vatNumber,
      is_vat_verified: user.isVatVerified,
      vat_verified_at: user.vatVerifiedAt?.toISOString(),
      company_name: user.companyName,
      years_experience: user.yearsExperience,
      hourly_rate_bgn: user.hourlyRateBgn,
      service_categories: user.serviceCategories,
      tasks_completed: user.tasksCompleted,
      average_rating: user.averageRating,
      total_reviews: user.totalReviews,
      response_time_hours: user.responseTimeHours,
      acceptance_rate: user.acceptanceRate,
      preferred_language: user.preferredLanguage,
      preferred_contact: user.preferredContact,
      bio: user.bio,
      avatar_url: user.avatarUrl,
      is_banned: user.isBanned,
      ban_reason: user.banReason,
      banned_at: user.bannedAt?.toISOString(),
      last_active_at: user.lastActiveAt?.toISOString(),
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }
  }
}
