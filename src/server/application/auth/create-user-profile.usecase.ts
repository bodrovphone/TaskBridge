/**
 * Create User Profile Use Case
 * Handles the business logic for creating a new user profile
 */

import { Result } from '@/server/shared/types/result'
import { ConflictError } from '@/server/shared/errors/base.error'
import { User } from '@/server/domain/user/user.entity'
import { CreateUserProfileDto } from '@/server/domain/user/user.types'
import { UserBusinessRules } from '@/server/domain/user/user.rules'
import type { UserRepository } from '@/server/infrastructure/supabase/user.repository'

export class CreateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: CreateUserProfileDto): Promise<Result<User, Error>> {
    try {
      // 1. Validate business rules
      const validation = UserBusinessRules.validateProfileCreation(dto)
      if (validation.isError()) {
        return validation as Result<never, Error>
      }

      // 2. Check if user already exists by auth ID
      const existingByAuthId = await this.userRepository.findByAuthId(dto.authUserId)
      if (existingByAuthId) {
        return Result.error(
          new ConflictError('User profile already exists')
        )
      }

      // 3. Check if email is already taken (edge case: manual DB entry)
      const existingByEmail = await this.userRepository.findByEmail(dto.email)
      if (existingByEmail) {
        return Result.error(
          new ConflictError('Email is already registered')
        )
      }

      // 4. Create user entity with business logic
      const user = User.create(dto)

      // 5. Persist to database
      const savedUser = await this.userRepository.create(user)

      return Result.ok(savedUser)
    } catch (error) {
      return Result.error(error as Error)
    }
  }
}
