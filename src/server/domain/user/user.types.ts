/**
 * User Domain Types
 * Pure TypeScript types with no framework dependencies
 */

export type UserType = 'customer' | 'professional' | 'both'

export type PreferredLanguage = 'en' | 'bg' | 'ru'

export type PreferredContact = 'email' | 'phone' | 'sms'

export interface CreateUserProfileDto {
  authUserId: string  // From Supabase auth.users.id
  email: string
  fullName?: string
  phoneNumber?: string
  userType?: UserType
  preferredLanguage?: PreferredLanguage
  city?: string
  country?: string
}

export interface UpdateUserProfileDto {
  fullName?: string
  phoneNumber?: string
  city?: string
  neighborhood?: string
  country?: string
  bio?: string
  preferredLanguage?: PreferredLanguage
  preferredContact?: PreferredContact

  // Professional-specific
  companyName?: string
  vatNumber?: string
  yearsExperience?: number
  hourlyRateBgn?: number
  serviceCategories?: string[]
}

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  phoneNumber: string | null
  userType: UserType

  // Location
  city: string | null
  neighborhood: string | null
  country: string

  // Verification
  isPhoneVerified: boolean
  isEmailVerified: boolean
  phoneVerifiedAt: Date | null
  emailVerifiedAt: Date | null

  // Professional info
  vatNumber: string | null
  isVatVerified: boolean
  vatVerifiedAt: Date | null
  companyName: string | null
  yearsExperience: number | null
  hourlyRateBgn: number | null
  serviceCategories: string[]

  // Statistics
  tasksCompleted: number
  averageRating: number | null
  totalReviews: number
  responseTimeHours: number | null
  acceptanceRate: number | null

  // Settings
  preferredLanguage: PreferredLanguage
  preferredContact: PreferredContact
  bio: string | null
  avatarUrl: string | null

  // Status
  isBanned: boolean
  banReason: string | null
  bannedAt: Date | null
  lastActiveAt: Date | null

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
