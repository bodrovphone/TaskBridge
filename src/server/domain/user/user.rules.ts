/**
 * User Business Rules
 * Domain-level validation and business constraints
 * Framework-agnostic - can be used anywhere
 */

import { Result } from '@/server/shared/types/result';
import {
  ValidationError,
  BusinessRuleError,
} from '@/server/shared/errors/base.error';
import { CreateUserProfileDto, UpdateUserProfileDto } from './user.types';
import { User } from './user.entity';

export class UserBusinessRules {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (accepts any format for now)
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Accept any non-empty phone number format for now
    return phone.trim().length > 0;
  }

  /**
   * Validate Bulgarian VAT number format
   */
  static isValidBulgarianVAT(vat: string): boolean {
    // Bulgarian VAT: 9 or 10 digits
    const vatRegex = /^\d{9,10}$/;
    return vatRegex.test(vat);
  }

  /**
   * Validate full name
   */
  static isValidFullName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }

  /**
   * Validate profile creation
   */
  static validateProfileCreation(
    dto: CreateUserProfileDto
  ): Result<void, Error> {
    // Email validation
    if (!dto.email || !this.isValidEmail(dto.email)) {
      return Result.error(new ValidationError('Invalid email format', 'email'));
    }

    // Full name validation (if provided)
    if (dto.fullName && !this.isValidFullName(dto.fullName)) {
      return Result.error(
        new ValidationError(
          'Full name must be between 2 and 100 characters',
          'fullName'
        )
      );
    }

    // Phone number validation (if provided)
    if (dto.phoneNumber && !this.isValidPhoneNumber(dto.phoneNumber)) {
      return Result.error(
        new ValidationError('Invalid phone number format', 'phoneNumber')
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Validate profile update
   */
  static validateProfileUpdate(dto: UpdateUserProfileDto): Result<void, Error> {
    // Full name validation
    if (dto.fullName !== undefined && !this.isValidFullName(dto.fullName)) {
      return Result.error(
        new ValidationError(
          'Full name must be between 2 and 100 characters',
          'fullName'
        )
      );
    }

    // Phone number validation
    if (
      dto.phoneNumber !== undefined &&
      !this.isValidPhoneNumber(dto.phoneNumber)
    ) {
      return Result.error(
        new ValidationError('Invalid phone number format', 'phoneNumber')
      );
    }

    // VAT number validation
    if (
      dto.vatNumber !== undefined &&
      !this.isValidBulgarianVAT(dto.vatNumber)
    ) {
      return Result.error(
        new ValidationError('Invalid Bulgarian VAT number format', 'vatNumber')
      );
    }

    // Years of experience validation
    if (dto.yearsExperience !== undefined) {
      if (dto.yearsExperience < 0 || dto.yearsExperience > 70) {
        return Result.error(
          new ValidationError(
            'Years of experience must be between 0 and 70',
            'yearsExperience'
          )
        );
      }
    }

    // Hourly rate validation
    if (dto.hourlyRateBgn !== undefined) {
      if (dto.hourlyRateBgn < 0 || dto.hourlyRateBgn > 5000) {
        return Result.error(
          new ValidationError(
            'Hourly rate must be between 0 and 5000 EUR',
            'hourlyRateBgn'
          )
        );
      }
    }

    return Result.ok(undefined);
  }

  /**
   * Check if user can become a professional (complete their professional profile)
   */
  static canBecomeProfessional(user: User): Result<void, Error> {
    if (user.isBanned) {
      return Result.error(
        new BusinessRuleError('Banned users cannot become professionals')
      );
    }

    if (!user.isEmailVerified) {
      return Result.error(
        new BusinessRuleError('Email must be verified to become a professional')
      );
    }

    if (user.hasProfessionalProfile()) {
      return Result.error(
        new BusinessRuleError('User already has a professional profile')
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Check if user can create a task (any verified user can create tasks)
   */
  static canCreateTask(user: User): Result<void, Error> {
    if (user.isBanned) {
      return Result.error(
        new BusinessRuleError('Banned users cannot create tasks')
      );
    }

    if (!user.isEmailVerified) {
      return Result.error(
        new BusinessRuleError('Email must be verified to create tasks')
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Check if user can apply to tasks (must have professional profile)
   */
  static canApplyToTask(user: User): Result<void, Error> {
    if (user.isBanned) {
      return Result.error(
        new BusinessRuleError('Banned users cannot apply to tasks')
      );
    }

    if (!user.hasProfessionalProfile()) {
      return Result.error(
        new BusinessRuleError(
          'You need a complete professional profile to apply to tasks'
        )
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Check if user can leave a review
   */
  static canLeaveReview(user: User): Result<void, Error> {
    if (user.isBanned) {
      return Result.error(
        new BusinessRuleError('Banned users cannot leave reviews')
      );
    }

    if (!user.isEmailVerified) {
      return Result.error(
        new BusinessRuleError('Email must be verified to leave reviews')
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Validate service categories (professional setup)
   */
  static validateServiceCategories(categories: string[]): Result<void, Error> {
    if (categories.length === 0) {
      return Result.error(
        new ValidationError(
          'At least one service category must be selected',
          'serviceCategories'
        )
      );
    }

    if (categories.length > 10) {
      return Result.error(
        new ValidationError(
          'Maximum 10 service categories allowed',
          'serviceCategories'
        )
      );
    }

    // Check for duplicates
    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      return Result.error(
        new ValidationError(
          'Duplicate service categories not allowed',
          'serviceCategories'
        )
      );
    }

    return Result.ok(undefined);
  }
}
