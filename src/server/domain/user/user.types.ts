/**
 * User Domain Types
 * Pure TypeScript types with no framework dependencies
 */

export type PreferredLanguage = 'en' | 'bg' | 'ru' | 'ua'

export type PreferredContact = 'email' | 'phone' | 'sms' | 'telegram'

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable'

export interface WorkingHours {
  start: string // Format: "HH:MM" (24-hour)
  end: string   // Format: "HH:MM" (24-hour)
}

/**
 * Gallery Item for Professional Portfolio
 * Simple image + caption structure (Premium feature - top 5 professionals per category)
 * Max 5 items per professional
 */
export interface GalleryItem {
  id: string           // Unique ID for the item
  imageUrl: string     // Supabase Storage URL
  caption: string      // Short caption/description
  order: number        // Display order (0-4)
  createdAt: string    // ISO date string
}

/**
 * Service Item for Professional Price List
 * Professionals can list their services with pricing
 * Max 10 services per professional
 */
export interface ServiceItem {
  id: string           // Unique ID for the service
  name: string         // Service name (e.g., "Plumbing repair")
  price: string        // Price display (e.g., "25 €/час", "от 15 €")
  description: string  // Brief description
  order: number        // Display order
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  telegram: boolean
  taskUpdates: boolean
  weeklyDigest: boolean
  marketing: boolean
}

export interface PrivacySettings {
  profileVisible: boolean
  showPhone: boolean
  showEmail: boolean
  showContactInfo: boolean
}

export interface CreateUserProfileDto {
  authUserId: string  // From Supabase auth.users.id
  email: string
  fullName?: string
  phoneNumber?: string
  preferredLanguage?: PreferredLanguage
  city?: string
  country?: string
}

export interface UpdateUserProfileDto {
  // Basic Info
  fullName?: string
  phoneNumber?: string
  city?: string
  neighborhood?: string
  country?: string
  bio?: string
  preferredLanguage?: PreferredLanguage
  preferredContact?: PreferredContact
  avatarUrl?: string

  // Professional-specific
  professionalTitle?: string
  companyName?: string
  vatNumber?: string
  yearsExperience?: number
  hourlyRateBgn?: number
  serviceCategories?: string[]
  availabilityStatus?: AvailabilityStatus
  responseTimeHours?: number | null
  serviceAreaCities?: string[]
  paymentMethods?: string[]
  languages?: string[]
  weekdayHours?: WorkingHours
  weekendHours?: WorkingHours
  gallery?: GalleryItem[]
  services?: ServiceItem[]

  // Settings
  notificationPreferences?: NotificationPreferences
  privacySettings?: PrivacySettings

  // Telegram Integration
  telegramId?: bigint | null
  telegramUsername?: string | null
  telegramFirstName?: string | null
  telegramLastName?: string | null
  telegramPhotoUrl?: string | null
  preferredNotificationChannel?: 'email' | 'telegram' | 'both' | null
}

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  phoneNumber: string | null

  // Location
  city: string | null
  neighborhood: string | null
  country: string

  // Verification
  isPhoneVerified: boolean
  isEmailVerified: boolean
  phoneVerifiedAt: Date | null
  emailVerifiedAt: Date | null

  // Customer-specific
  totalSpentBgn: number

  // Professional info
  professionalTitle: string | null
  vatNumber: string | null
  isVatVerified: boolean
  vatVerifiedAt: Date | null
  companyName: string | null
  yearsExperience: number | null
  hourlyRateBgn: number | null
  serviceCategories: string[]
  availabilityStatus: AvailabilityStatus
  serviceAreaCities: string[]
  paymentMethods: string[]
  languages: string[]
  weekdayHours: WorkingHours
  weekendHours: WorkingHours
  totalEarningsBgn: number
  profileViews: number
  gallery: GalleryItem[]
  services: ServiceItem[]

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
  notificationPreferences: NotificationPreferences
  privacySettings: PrivacySettings

  // Telegram Integration
  telegramId: bigint | null
  telegramUsername: string | null
  telegramFirstName: string | null
  telegramLastName: string | null
  telegramPhotoUrl: string | null
  preferredNotificationChannel: 'email' | 'telegram' | 'both' | null

  // Status
  isBanned: boolean
  banReason: string | null
  bannedAt: Date | null
  lastActiveAt: Date | null

  // Badge fields
  isEarlyAdopter: boolean
  earlyAdopterCategories: string[]
  isTopProfessional: boolean
  topProfessionalUntil: Date | null
  topProfessionalTasksCount: number
  isFeatured: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
