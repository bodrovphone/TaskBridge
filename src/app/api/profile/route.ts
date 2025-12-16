/**
 * Profile API Route
 * Handles profile retrieval and updates for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'
import { UpdateUserProfileDto } from '@/server/domain/user/user.types'
import { authenticateRequest } from '@/lib/auth/api-auth'
import { checkAndAssignEarlyAdopterStatus } from '@/server/badges/badge.service'
import { translateProfessionalProfileToBulgarian } from '@/lib/services/translation'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/profile
 * Get current authenticated user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch profile from database
    const userRepository = new UserRepository()
    const user = await userRepository.findByAuthId(authUser.id)

    if (!user) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // 3. Return profile
    return NextResponse.json({
      profile: user.toProfile(),
    })
  } catch (error) {
    console.error('GET /api/profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profile
 * Update current authenticated user's profile
 *
 * Request body: Partial<UpdateUserProfileDto>
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    let updates: UpdateUserProfileDto
    try {
      updates = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 3. Fetch current user
    const userRepository = new UserRepository()
    const user = await userRepository.findByAuthId(authUser.id)

    if (!user) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // 4. Apply updates to user entity
    if (updates.fullName !== undefined) user.fullName = updates.fullName
    // Only update phone number if it's a non-empty string to avoid UNIQUE constraint violations with null/empty values
    if (updates.phoneNumber !== undefined && updates.phoneNumber !== null && updates.phoneNumber.trim() !== '') {
      user.phoneNumber = updates.phoneNumber
    }
    // Convert empty city string to null (CHECK constraint only allows NULL or valid city slugs)
    if (updates.city !== undefined) {
      user.city = updates.city && updates.city.trim() !== '' ? updates.city : null
    }
    if (updates.neighborhood !== undefined) user.neighborhood = updates.neighborhood
    if (updates.country !== undefined) user.country = updates.country
    if (updates.bio !== undefined) user.bio = updates.bio
    if (updates.preferredLanguage !== undefined) user.preferredLanguage = updates.preferredLanguage
    if (updates.preferredContact !== undefined) user.preferredContact = updates.preferredContact
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl

    // Professional-specific updates
    if (updates.professionalTitle !== undefined) user.professionalTitle = updates.professionalTitle
    if (updates.companyName !== undefined) user.companyName = updates.companyName
    // Only update VAT number if it's a non-empty string to avoid UNIQUE constraint violations with null/empty values
    if (updates.vatNumber !== undefined && updates.vatNumber !== null && updates.vatNumber.trim() !== '') {
      user.vatNumber = updates.vatNumber
    }
    if (updates.yearsExperience !== undefined) user.yearsExperience = updates.yearsExperience
    if (updates.hourlyRateBgn !== undefined) user.hourlyRateBgn = updates.hourlyRateBgn
    // Track if service categories are being updated for early adopter check
    const previousCategories = user.serviceCategories || []
    const categoriesUpdated = updates.serviceCategories !== undefined
    if (updates.serviceCategories !== undefined) user.serviceCategories = updates.serviceCategories
    if (updates.availabilityStatus !== undefined) user.availabilityStatus = updates.availabilityStatus
    if (updates.responseTimeHours !== undefined) user.responseTimeHours = updates.responseTimeHours
    if (updates.serviceAreaCities !== undefined) user.serviceAreaCities = updates.serviceAreaCities
    if (updates.paymentMethods !== undefined) user.paymentMethods = updates.paymentMethods
    if (updates.languages !== undefined) user.languages = updates.languages
    if (updates.weekdayHours !== undefined) user.weekdayHours = updates.weekdayHours
    if (updates.weekendHours !== undefined) user.weekendHours = updates.weekendHours
    if (updates.gallery !== undefined) user.gallery = updates.gallery
    if (updates.services !== undefined) user.services = updates.services

    // Settings updates
    if (updates.notificationPreferences !== undefined) {
      user.notificationPreferences = updates.notificationPreferences
    }
    if (updates.privacySettings !== undefined) {
      user.privacySettings = updates.privacySettings
    }

    // Telegram updates
    if (updates.telegramId !== undefined) user.telegramId = updates.telegramId
    if (updates.telegramUsername !== undefined) user.telegramUsername = updates.telegramUsername
    if (updates.telegramFirstName !== undefined) user.telegramFirstName = updates.telegramFirstName
    if (updates.telegramLastName !== undefined) user.telegramLastName = updates.telegramLastName
    if (updates.telegramPhotoUrl !== undefined) user.telegramPhotoUrl = updates.telegramPhotoUrl
    if (updates.preferredNotificationChannel !== undefined) {
      user.preferredNotificationChannel = updates.preferredNotificationChannel
    }

    // Update timestamp
    user.updatedAt = new Date()

    // 5. Save to database
    const updatedUser = await userRepository.update(user)

    // 6. Check for early adopter status if categories were updated
    if (categoriesUpdated && updates.serviceCategories) {
      try {
        await checkAndAssignEarlyAdopterStatus(
          user.id,
          updates.serviceCategories,
          previousCategories
        )
      } catch (error) {
        // Log but don't fail the request - early adopter is a nice-to-have
        console.error('Early adopter check failed:', error)
      }
    }

    // 7. Translate professional profile fields to Bulgarian (non-blocking)
    // Triggered when relevant fields are updated from a non-BG locale
    // Get the request locale from Accept-Language header or query param
    const acceptLanguage = request.headers.get('Accept-Language') || ''
    const requestLocale = request.nextUrl.searchParams.get('locale') ||
                          acceptLanguage.split(',')[0]?.split('-')[0] || 'bg'

    const translationFieldsUpdated = updates.professionalTitle !== undefined ||
                                     updates.bio !== undefined ||
                                     updates.services !== undefined

    // Translate if content was entered in a non-BG locale
    if (translationFieldsUpdated && requestLocale !== 'bg') {
      // Fire-and-forget translation (don't block the response)
      translateProfessionalProfileToBulgarian({
        professionalTitle: user.professionalTitle,
        bio: user.bio,
        services: user.services,
        sourceLocale: requestLocale,
      }).then(async (translations) => {
        // Only save if we got actual translations
        if (translations.professional_title_bg || translations.bio_bg || translations.services_bg) {
          try {
            const supabase = createAdminClient()
            await supabase
              .from('users')
              .update({
                professional_title_bg: translations.professional_title_bg,
                bio_bg: translations.bio_bg,
                services_bg: translations.services_bg,
                content_source_language: translations.content_source_language,
              })
              .eq('id', user.id)

            console.log('[Profile] Bulgarian translations saved for user:', user.id)
          } catch (translationSaveError) {
            console.error('[Profile] Failed to save translations:', translationSaveError)
          }
        }
      }).catch((translationError) => {
        console.error('[Profile] Translation failed:', translationError)
      })
    }

    // 8. Return updated profile
    return NextResponse.json({
      profile: updatedUser.toProfile(),
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('PUT /api/profile error:', error)

    // Handle specific database constraint violations
    if (error instanceof Error) {
      // Duplicate phone number
      if (error.message.includes('users_phone_key')) {
        return NextResponse.json(
          { error: 'This phone number is already registered to another account' },
          { status: 409 }
        )
      }

      // Duplicate email
      if (error.message.includes('users_email_key')) {
        return NextResponse.json(
          { error: 'This email is already registered to another account' },
          { status: 409 }
        )
      }

      // Duplicate VAT number
      if (error.message.includes('users_vat_number_key')) {
        return NextResponse.json(
          { error: 'This VAT number is already registered to another account' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
