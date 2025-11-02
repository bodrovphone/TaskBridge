/**
 * User Domain Entity
 * Pure business logic with no framework dependencies
 * Can be used in any framework (Next.js, NestJS, Express, etc.)
 */

import {
  UserType,
  UserProfile,
  CreateUserProfileDto,
  PreferredLanguage,
  PreferredContact,
  AvailabilityStatus,
  WorkingHours,
  NotificationPreferences,
  PrivacySettings
} from './user.types'
import { BusinessRuleError } from '@/server/shared/errors/base.error'

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public fullName: string | null,
    public phoneNumber: string | null,
    public userType: UserType,
    public city: string | null,
    public neighborhood: string | null,
    public country: string,
    public isPhoneVerified: boolean,
    public isEmailVerified: boolean,
    public phoneVerifiedAt: Date | null,
    public emailVerifiedAt: Date | null,
    // Customer-specific
    public totalSpentBgn: number,
    // Professional info
    public professionalTitle: string | null,
    public vatNumber: string | null,
    public isVatVerified: boolean,
    public vatVerifiedAt: Date | null,
    public companyName: string | null,
    public yearsExperience: number | null,
    public hourlyRateBgn: number | null,
    public serviceCategories: string[],
    public availabilityStatus: AvailabilityStatus,
    public serviceAreaCities: string[],
    public paymentMethods: string[],
    public languages: string[],
    public weekdayHours: WorkingHours,
    public weekendHours: WorkingHours,
    public totalEarningsBgn: number,
    public profileViews: number,
    // Statistics
    public tasksCompleted: number,
    public averageRating: number | null,
    public totalReviews: number,
    public responseTimeHours: number | null,
    public acceptanceRate: number | null,
    // Settings
    public preferredLanguage: PreferredLanguage,
    public preferredContact: PreferredContact,
    public bio: string | null,
    public avatarUrl: string | null,
    public notificationPreferences: NotificationPreferences,
    public privacySettings: PrivacySettings,
    // Telegram Integration
    public telegramId: bigint | null,
    public telegramUsername: string | null,
    public telegramFirstName: string | null,
    public telegramLastName: string | null,
    public telegramPhotoUrl: string | null,
    public preferredNotificationChannel: 'email' | 'telegram' | 'both' | null,
    // Status
    public isBanned: boolean,
    public banReason: string | null,
    public bannedAt: Date | null,
    public lastActiveAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Factory method to create a new user from DTO
   */
  static create(dto: CreateUserProfileDto): User {
    const now = new Date()

    return new User(
      dto.authUserId,
      dto.email,
      dto.fullName || null,
      dto.phoneNumber || null,
      dto.userType || 'customer',
      dto.city || null,
      null, // neighborhood
      dto.country || 'Bulgaria',
      false, // isPhoneVerified
      false, // isEmailVerified
      null, // phoneVerifiedAt
      null, // emailVerifiedAt
      0, // totalSpentBgn
      null, // professionalTitle
      null, // vatNumber
      false, // isVatVerified
      null, // vatVerifiedAt
      null, // companyName
      null, // yearsExperience
      null, // hourlyRateBgn
      [], // serviceCategories
      'available', // availabilityStatus
      [], // serviceAreaCities
      ['cash', 'bank_transfer'], // paymentMethods
      [dto.preferredLanguage || 'bg'], // languages
      { start: '08:00', end: '18:00' }, // weekdayHours
      { start: '09:00', end: '14:00' }, // weekendHours
      0, // totalEarningsBgn
      0, // profileViews
      0, // tasksCompleted
      null, // averageRating
      0, // totalReviews
      null, // responseTimeHours
      null, // acceptanceRate
      dto.preferredLanguage || 'bg',
      'email', // preferredContact
      null, // bio
      null, // avatarUrl
      { email: true, sms: true, push: true, telegram: true, taskUpdates: true, weeklyDigest: false, marketing: false }, // notificationPreferences
      { profileVisible: true, showPhone: false, showEmail: false, showContactInfo: true }, // privacySettings
      null, // telegramId
      null, // telegramUsername
      null, // telegramFirstName
      null, // telegramLastName
      null, // telegramPhotoUrl
      null, // preferredNotificationChannel
      false, // isBanned
      null, // banReason
      null, // bannedAt
      now, // lastActiveAt
      now, // createdAt
      now // updatedAt
    )
  }

  /**
   * Factory method to create from database record
   */
  static fromProfile(profile: UserProfile): User {
    return new User(
      profile.id,
      profile.email,
      profile.fullName,
      profile.phoneNumber,
      profile.userType,
      profile.city,
      profile.neighborhood,
      profile.country,
      profile.isPhoneVerified,
      profile.isEmailVerified,
      profile.phoneVerifiedAt,
      profile.emailVerifiedAt,
      profile.totalSpentBgn,
      profile.professionalTitle,
      profile.vatNumber,
      profile.isVatVerified,
      profile.vatVerifiedAt,
      profile.companyName,
      profile.yearsExperience,
      profile.hourlyRateBgn,
      profile.serviceCategories,
      profile.availabilityStatus,
      profile.serviceAreaCities,
      profile.paymentMethods,
      profile.languages,
      profile.weekdayHours,
      profile.weekendHours,
      profile.totalEarningsBgn,
      profile.profileViews,
      profile.tasksCompleted,
      profile.averageRating,
      profile.totalReviews,
      profile.responseTimeHours,
      profile.acceptanceRate,
      profile.preferredLanguage,
      profile.preferredContact,
      profile.bio,
      profile.avatarUrl,
      profile.notificationPreferences,
      profile.privacySettings,
      profile.telegramId,
      profile.telegramUsername,
      profile.telegramFirstName,
      profile.telegramLastName,
      profile.telegramPhotoUrl,
      profile.preferredNotificationChannel,
      profile.isBanned,
      profile.banReason,
      profile.bannedAt,
      profile.lastActiveAt,
      profile.createdAt,
      profile.updatedAt
    )
  }

  /**
   * Convert to profile object
   */
  toProfile(): UserProfile {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      userType: this.userType,
      city: this.city,
      neighborhood: this.neighborhood,
      country: this.country,
      isPhoneVerified: this.isPhoneVerified,
      isEmailVerified: this.isEmailVerified,
      phoneVerifiedAt: this.phoneVerifiedAt,
      emailVerifiedAt: this.emailVerifiedAt,
      totalSpentBgn: this.totalSpentBgn,
      professionalTitle: this.professionalTitle,
      vatNumber: this.vatNumber,
      isVatVerified: this.isVatVerified,
      vatVerifiedAt: this.vatVerifiedAt,
      companyName: this.companyName,
      yearsExperience: this.yearsExperience,
      hourlyRateBgn: this.hourlyRateBgn,
      serviceCategories: this.serviceCategories,
      availabilityStatus: this.availabilityStatus,
      serviceAreaCities: this.serviceAreaCities,
      paymentMethods: this.paymentMethods,
      languages: this.languages,
      weekdayHours: this.weekdayHours,
      weekendHours: this.weekendHours,
      totalEarningsBgn: this.totalEarningsBgn,
      profileViews: this.profileViews,
      tasksCompleted: this.tasksCompleted,
      averageRating: this.averageRating,
      totalReviews: this.totalReviews,
      responseTimeHours: this.responseTimeHours,
      acceptanceRate: this.acceptanceRate,
      preferredLanguage: this.preferredLanguage,
      preferredContact: this.preferredContact,
      bio: this.bio,
      avatarUrl: this.avatarUrl,
      notificationPreferences: this.notificationPreferences,
      privacySettings: this.privacySettings,
      telegramId: this.telegramId,
      telegramUsername: this.telegramUsername,
      telegramFirstName: this.telegramFirstName,
      telegramLastName: this.telegramLastName,
      telegramPhotoUrl: this.telegramPhotoUrl,
      preferredNotificationChannel: this.preferredNotificationChannel,
      isBanned: this.isBanned,
      banReason: this.banReason,
      bannedAt: this.bannedAt,
      lastActiveAt: this.lastActiveAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  // ============================================
  // BUSINESS LOGIC METHODS
  // ============================================

  /**
   * Check if user can create a task
   */
  canCreateTask(): boolean {
    if (this.isBanned) return false
    if (this.userType === 'professional') return false
    return this.isEmailVerified
  }

  /**
   * Check if user can apply to tasks
   */
  canApplyToTask(): boolean {
    if (this.isBanned) return false
    if (this.userType === 'customer') return false
    return this.isEmailVerified && this.isPhoneVerified
  }

  /**
   * Check if user can leave reviews
   */
  canLeaveReview(): boolean {
    if (this.isBanned) return false
    return this.isEmailVerified
  }

  /**
   * Check if user is verified professional
   */
  isVerifiedProfessional(): boolean {
    return (
      (this.userType === 'professional' || this.userType === 'both') &&
      this.isEmailVerified &&
      this.isPhoneVerified
    )
  }

  /**
   * Check if user is verified customer
   */
  isVerifiedCustomer(): boolean {
    return (
      (this.userType === 'customer' || this.userType === 'both') &&
      this.isEmailVerified
    )
  }

  /**
   * Upgrade customer to professional
   */
  upgradeToProfessional(): void {
    if (!this.isEmailVerified) {
      throw new BusinessRuleError('Email must be verified before upgrading to professional')
    }

    if (!this.isPhoneVerified) {
      throw new BusinessRuleError('Phone must be verified before upgrading to professional')
    }

    if (this.userType === 'customer') {
      this.userType = 'both'
      this.updatedAt = new Date()
    }
  }

  /**
   * Mark email as verified
   */
  verifyEmail(): void {
    if (!this.isEmailVerified) {
      this.isEmailVerified = true
      this.emailVerifiedAt = new Date()
      this.updatedAt = new Date()
    }
  }

  /**
   * Mark phone as verified
   */
  verifyPhone(): void {
    if (!this.isPhoneVerified) {
      this.isPhoneVerified = true
      this.phoneVerifiedAt = new Date()
      this.updatedAt = new Date()
    }
  }

  /**
   * Mark VAT as verified
   */
  verifyVat(): void {
    if (this.vatNumber && !this.isVatVerified) {
      this.isVatVerified = true
      this.vatVerifiedAt = new Date()
      this.updatedAt = new Date()
    }
  }

  /**
   * Ban user
   */
  ban(reason: string): void {
    this.isBanned = true
    this.banReason = reason
    this.bannedAt = new Date()
    this.updatedAt = new Date()
  }

  /**
   * Unban user
   */
  unban(): void {
    this.isBanned = false
    this.banReason = null
    this.bannedAt = null
    this.updatedAt = new Date()
  }

  /**
   * Update last active timestamp
   */
  updateLastActive(): void {
    this.lastActiveAt = new Date()
    this.updatedAt = new Date()
  }

  /**
   * Update statistics after completing a task
   */
  updateStatisticsAfterTaskCompletion(rating: number): void {
    this.tasksCompleted += 1

    // Update average rating
    if (this.averageRating === null) {
      this.averageRating = rating
    } else {
      const totalRating = this.averageRating * this.totalReviews
      this.averageRating = (totalRating + rating) / (this.totalReviews + 1)
    }

    this.totalReviews += 1
    this.updatedAt = new Date()
  }
}
