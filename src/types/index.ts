/**
 * Types Barrel Export
 *
 * Central export point for all type definitions.
 *
 * Note: API, APIType, and APIKeys are available globally via api.d.ts
 * No import needed - just use API['TypeName'] anywhere.
 *
 * Usage:
 * const user: API['UserProfile'] = { ... }
 * import type { Application, Notification } from '@/types'
 */

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
