/**
 * Types Barrel Export
 *
 * Central export point for all type definitions.
 *
 * Usage:
 * import type { API, APIType } from '@/types'
 * import type { Application, Notification } from '@/types'
 */

// =============================================================================
// API Type Registry (NEW - Recommended)
// =============================================================================
export type { API, APIType, APIKeys } from './api'

// =============================================================================
// Individual Types (Backwards Compatibility)
// =============================================================================

// Application types
export type {
  Application,
  ApplicationStatus,
  ApplicationProfessional,
  ApplicationFilters,
  ApplicationStats,
  ProfessionalReview,
  SortOption,
} from './applications'

// Notification types
export type {
  Notification,
  NotificationType,
  NotificationFilter,
} from './notifications'

// Question types
export type {
  Question,
  Answer,
  QuestionUser,
  QuestionWithAnswer,
  QuestionFormData,
  AnswerFormData,
  QuestionStats,
} from './questions'
