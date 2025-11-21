/**
 * Profile API Route
 * Handles profile retrieval and updates for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'
import { UpdateUserProfileDto } from '@/server/domain/user/user.types'
import { authenticateRequest } from '@/lib/auth/api-auth'

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
    if (updates.city !== undefined) user.city = updates.city
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
    if (updates.serviceCategories !== undefined) user.serviceCategories = updates.serviceCategories
    if (updates.availabilityStatus !== undefined) user.availabilityStatus = updates.availabilityStatus
    if (updates.responseTimeHours !== undefined) user.responseTimeHours = updates.responseTimeHours
    if (updates.serviceAreaCities !== undefined) user.serviceAreaCities = updates.serviceAreaCities
    if (updates.paymentMethods !== undefined) user.paymentMethods = updates.paymentMethods
    if (updates.languages !== undefined) user.languages = updates.languages
    if (updates.weekdayHours !== undefined) user.weekdayHours = updates.weekdayHours
    if (updates.weekendHours !== undefined) user.weekendHours = updates.weekendHours

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

    // 6. Return updated profile
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
