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
import type { UserRepository } from '@/server/infrastructure/supabase/user.repository'

export class AuthService {
  private createUserProfileUseCase: CreateUserProfileUseCase

  constructor(private userRepository: UserRepository) {
    this.createUserProfileUseCase = new CreateUserProfileUseCase(userRepository)
  }

  /**
   * Create or sync user profile after Supabase authentication
   * This is called after successful signup or OAuth login
   */
  async createOrSyncUserProfile(
    authUserId: string,
    email: string,
    metadata?: {
      fullName?: string
      phoneNumber?: string
      avatarUrl?: string
    }
  ): Promise<Result<User, Error>> {
    try {
      // 1. Check if profile already exists
      const existingUser = await this.userRepository.findByAuthId(authUserId)

      if (existingUser) {
        // Profile exists - update last active
        existingUser.updateLastActive()
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
        preferredLanguage: 'bg', // Default to Bulgarian
      }

      const createResult: Result<User, Error> = await this.createUserProfileUseCase.execute(dto)

      // Early return on error
      if (createResult.isError()) {
        return createResult
      }

      // 3. Extract created user and update avatar if provided
      const createdUser = (createResult as any).value as User

      if (metadata?.avatarUrl) {
        createdUser.avatarUrl = metadata.avatarUrl
        const updatedUser = await this.userRepository.update(createdUser)
        return Result.ok(updatedUser)
      }

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
}
