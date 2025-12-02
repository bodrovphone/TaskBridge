/**
 * Auth Service
 * Orchestrates authentication-related use cases
 * Framework-agnostic business logic
 */

import { Result } from '@/server/shared/types/result'
import { UnauthorizedError, NotFoundError } from '@/server/shared/errors/base.error'
import { User } from '@/server/domain/user/user.entity'
import { CreateUserProfileDto } from '@/server/domain/user/user.types'
import { CreateUserProfileUseCase } from './create-user-profile.usecase'
import { createNotification } from '@/lib/services/notification-service'
import type { UserRepository } from '@/server/infrastructure/supabase/user.repository'

export class AuthService {
  private createUserProfileUseCase: CreateUserProfileUseCase

  constructor(private userRepository: UserRepository) {
    this.createUserProfileUseCase = new CreateUserProfileUseCase(userRepository)
  }

  /**
   * Create or sync user profile after Supabase authentication
   * This is called after successful signup or OAuth login
   *
   * @param authUserId - Supabase auth user ID
   * @param email - User's email address
   * @param metadata - Additional user metadata
   * @param metadata.isOAuthUser - If true, email is already verified by OAuth provider (Google/Facebook)
   */
  async createOrSyncUserProfile(
    authUserId: string,
    email: string,
    metadata?: {
      fullName?: string
      phoneNumber?: string
      avatarUrl?: string
      locale?: 'en' | 'bg' | 'ru' | 'ua'
      isOAuthUser?: boolean // OAuth providers verify email, so auto-verify for these users
    }
  ): Promise<Result<User, Error>> {
    try {
      // 1. Check if profile already exists
      const existingUser = await this.userRepository.findByAuthId(authUserId)

      if (existingUser) {
        // Profile exists - update last active
        existingUser.updateLastActive()

        // Auto-verify email for OAuth users if not already verified
        // This handles existing users who registered before this fix
        if (metadata?.isOAuthUser && !existingUser.isEmailVerified) {
          existingUser.verifyEmail()
          console.log('[Auth] Auto-verified email for existing OAuth user:', authUserId)
        }

        // Update preferred language if locale is provided (preserves locale through OAuth flow)
        if (metadata?.locale && existingUser.preferredLanguage !== metadata.locale) {
          existingUser.preferredLanguage = metadata.locale
          console.log('[Auth] Updated preferred language for user:', authUserId, 'to:', metadata.locale)
        }

        const updatedUser = await this.userRepository.update(existingUser)
        return Result.ok(updatedUser)
      }

      // 2. Profile doesn't exist - create it
      const dto: CreateUserProfileDto = {
        authUserId,
        email,
        fullName: metadata?.fullName,
        phoneNumber: metadata?.phoneNumber,
        userType: 'customer', // Default to customer
        preferredLanguage: metadata?.locale || 'bg', // Use route locale or default to Bulgarian
      }

      const createResult: Result<User, Error> = await this.createUserProfileUseCase.execute(dto)

      // Early return on error
      if (createResult.isError()) {
        return createResult
      }

      // 3. Extract created user and update avatar if provided
      const createdUser = (createResult as any).value as User

      // 4. Auto-verify email for OAuth users (Google/Facebook verify email)
      if (metadata?.isOAuthUser) {
        createdUser.verifyEmail()
        console.log('[Auth] Auto-verified email for OAuth user:', authUserId)
      }

      if (metadata?.avatarUrl) {
        createdUser.avatarUrl = metadata.avatarUrl
      }

      // 5. Save updates (avatar and/or email verification)
      if (metadata?.avatarUrl || metadata?.isOAuthUser) {
        const updatedUser = await this.userRepository.update(createdUser)

        // Send welcome notification (in-app only for now)
        await this.sendWelcomeNotification(updatedUser.id, updatedUser.fullName || undefined)

        return Result.ok(updatedUser)
      }

      // Send welcome notification (in-app only for now)
      await this.sendWelcomeNotification(createdUser.id, createdUser.fullName || undefined)

      return Result.ok(createdUser)
    } catch (error) {
      return Result.error(error as Error)
    }
  }

  /**
   * Get current authenticated user profile by auth ID
   */
  async getUserProfile(authUserId: string): Promise<Result<User, Error>> {
    try {
      const user = await this.userRepository.findByAuthId(authUserId)

      if (!user) {
        return Result.error(
          new NotFoundError('User', authUserId)
        )
      }

      // Update last active timestamp
      user.updateLastActive()
      const updatedUser = await this.userRepository.update(user)

      return Result.ok(updatedUser)
    } catch (error) {
      return Result.error(error as Error)
    }
  }

  /**
   * Check if user is authenticated (has valid profile)
   */
  async isAuthenticated(authUserId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByAuthId(authUserId)
      return user !== null && !user.isBanned
    } catch (error) {
      return false
    }
  }

  /**
   * Verify user's email (called after email confirmation)
   */
  async verifyEmail(authUserId: string): Promise<Result<User, Error>> {
    try {
      const user = await this.userRepository.findByAuthId(authUserId)

      if (!user) {
        return Result.error(new NotFoundError('User', authUserId))
      }

      user.verifyEmail()
      const updatedUser = await this.userRepository.update(user)

      return Result.ok(updatedUser)
    } catch (error) {
      return Result.error(error as Error)
    }
  }

  /**
   * Verify user's phone (called after phone verification)
   */
  async verifyPhone(authUserId: string): Promise<Result<User, Error>> {
    try {
      const user = await this.userRepository.findByAuthId(authUserId)

      if (!user) {
        return Result.error(new NotFoundError('User', authUserId))
      }

      user.verifyPhone()
      const updatedUser = await this.userRepository.update(user)

      return Result.ok(updatedUser)
    } catch (error) {
      return Result.error(error as Error)
    }
  }

  /**
   * Send welcome notification to newly created user
   * Private helper method
   */
  private async sendWelcomeNotification(userId: string, fullName?: string): Promise<void> {
    try {
      const firstName = fullName?.split(' ')[0] || 'there'

      await createNotification({
        userId: userId,
        type: 'welcome_message',
        templateData: {
          userName: firstName,
        },
        actionUrl: '/browse-tasks',
        deliveryChannel: 'in_app', // In-app only (Telegram only if user connects it later)
      })

      console.log('[Auth] Welcome notification sent to user:', userId)
    } catch (error) {
      // Don't fail profile creation if notification fails
      console.error('[Auth] Failed to send welcome notification:', error)
    }
  }
}
