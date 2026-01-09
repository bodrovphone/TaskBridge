/**
 * Global API Type Registry
 *
 * Provides easy access to all DTOs and entity types via a flat namespace pattern.
 * Available globally without imports: API['UserProfile'], API['TaskCreate'], etc.
 *
 * @example
 * const user: API['UserProfile'] = { ... }
 * const task: API['TaskCreate'] = { title: 'Fix sink', ... }
 */

// =============================================================================
// User Domain Imports
// =============================================================================
import type {
  UserProfile,
  CreateUserProfileDto,
  UpdateUserProfileDto,
  PreferredLanguage,
  PreferredContact,
  AvailabilityStatus,
  RegistrationIntent,
  GalleryItem,
  ServiceItem,
  WorkingHours,
  NotificationPreferences,
  PrivacySettings,
} from '@/server/domain/user/user.types'

// =============================================================================
// Task Domain Imports
// =============================================================================
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskDbInsert,
  CreateTaskResult,
} from '@/server/tasks/task.types'

import type {
  TaskQueryParams,
  TaskQueryOptions,
  TaskSortOption,
  TaskQueryMode,
  PaginatedTasksResponse,
  TaskDetailResponse,
} from '@/server/tasks/task.query-types'

// =============================================================================
// Professional Domain Imports
// =============================================================================
import type {
  Professional,
  ProfessionalRaw,
  ProfessionalDetail,
  PaginatedProfessionalsResponse,
  CompletedTaskItem,
  ReviewItem,
  FeaturedCriteria,
} from '@/server/professionals/professional.types'

import type {
  ProfessionalQueryParams,
  ProfessionalSortOption,
} from '@/server/professionals/professional.query-types'

// =============================================================================
// Application Domain Imports
// =============================================================================
import type {
  Application,
  ApplicationStatus,
  ApplicationProfessional,
  ApplicationFilters,
  ApplicationStats,
  ProfessionalReview,
  SortOption as ApplicationSortOption,
} from '@/types/applications'

// =============================================================================
// Notification Domain Imports
// =============================================================================
import type {
  Notification,
  NotificationType,
  NotificationFilter,
} from '@/types/notifications'

// =============================================================================
// Review Domain Imports
// =============================================================================
import type {
  Review,
  ReviewSubmitData,
  PendingReviewTask,
  BlockType,
  CanCreateTaskResponse,
} from '@/features/reviews/lib/types'

// =============================================================================
// Question Domain Imports
// =============================================================================
import type {
  Question,
  Answer,
  QuestionUser,
  QuestionWithAnswer,
  QuestionFormData,
  AnswerFormData,
  QuestionStats,
} from '@/types/questions'

// =============================================================================
// UI Component Types (for component props)
// =============================================================================
import type {
  ProfessionalDataInput,
  ProfessionalDisplayData,
  ReviewDisplayItem,
  CompletedTaskDisplayItem,
  TaskSelectionItem,
} from '@/types/professionals-ui'

// =============================================================================
// Global API Type Registry Declaration
// =============================================================================

declare global {
  /**
   * Global API type registry - access all DTOs via API['TypeName']
   *
   * Organized by domain:
   * - User: UserProfile, UserCreate, UserUpdate
   * - Task: Task, TaskCreate, TaskUpdate, TaskStatus
   * - Professional: Professional, ProfessionalDetail
   * - Application: Application, ApplicationStatus
   * - Notification: Notification, NotificationType
   * - Review: Review, ReviewSubmit
   * - Question: Question, Answer
   */
  interface API {
    // ---------------------------------------------------------------------------
    // User Domain
    // ---------------------------------------------------------------------------
    /** Full user profile entity */
    UserProfile: UserProfile
    /** DTO for creating a new user */
    UserCreate: CreateUserProfileDto
    /** DTO for updating user profile */
    UserUpdate: UpdateUserProfileDto
    /** User's preferred language */
    PreferredLanguage: PreferredLanguage
    /** User's preferred contact method */
    PreferredContact: PreferredContact
    /** Professional availability status */
    AvailabilityStatus: AvailabilityStatus
    /** User registration intent (customer or professional) */
    RegistrationIntent: RegistrationIntent
    /** Portfolio gallery item */
    GalleryItem: GalleryItem
    /** Service offering with pricing */
    ServiceItem: ServiceItem
    /** Working hours configuration */
    WorkingHours: WorkingHours
    /** Notification preferences */
    NotificationPreferences: NotificationPreferences
    /** Privacy settings */
    PrivacySettings: PrivacySettings

    // ---------------------------------------------------------------------------
    // Task Domain
    // ---------------------------------------------------------------------------
    /** Task entity */
    Task: Task
    /** DTO for creating a new task */
    TaskCreate: CreateTaskInput
    /** DTO for updating a task */
    TaskUpdate: UpdateTaskInput
    /** Task lifecycle status */
    TaskStatus: TaskStatus
    /** Task database insert payload */
    TaskDbInsert: TaskDbInsert
    /** Task creation API response */
    TaskCreateResult: CreateTaskResult
    /** Task query parameters (raw from URL) */
    TaskQueryParams: TaskQueryParams
    /** Task query options (parsed/validated) */
    TaskQueryOptions: TaskQueryOptions
    /** Task sort option */
    TaskSortOption: TaskSortOption
    /** Task query preset mode */
    TaskQueryMode: TaskQueryMode
    /** Paginated tasks response */
    TasksResponse: PaginatedTasksResponse
    /** Single task detail response */
    TaskDetailResponse: TaskDetailResponse

    // ---------------------------------------------------------------------------
    // Professional Domain
    // ---------------------------------------------------------------------------
    /** Professional entity (public-safe fields) */
    Professional: Professional
    /** Professional raw database data */
    ProfessionalRaw: ProfessionalRaw
    /** Professional with extended detail */
    ProfessionalDetail: ProfessionalDetail
    /** Paginated professionals response */
    ProfessionalsResponse: PaginatedProfessionalsResponse
    /** Completed task item for professional profile */
    CompletedTaskItem: CompletedTaskItem
    /** Review item for professional profile */
    ReviewItem: ReviewItem
    /** Featured status criteria */
    FeaturedCriteria: FeaturedCriteria
    /** Professional query parameters */
    ProfessionalQueryParams: ProfessionalQueryParams
    /** Professional sort option */
    ProfessionalSortOption: ProfessionalSortOption

    // ---------------------------------------------------------------------------
    // Application Domain
    // ---------------------------------------------------------------------------
    /** Application entity */
    Application: Application
    /** Application lifecycle status */
    ApplicationStatus: ApplicationStatus
    /** Professional data within an application */
    ApplicationProfessional: ApplicationProfessional
    /** Application filter options */
    ApplicationFilters: ApplicationFilters
    /** Application statistics */
    ApplicationStats: ApplicationStats
    /** Professional review in application context */
    ProfessionalReview: ProfessionalReview
    /** Application sort option */
    ApplicationSortOption: ApplicationSortOption

    // ---------------------------------------------------------------------------
    // Notification Domain
    // ---------------------------------------------------------------------------
    /** Notification entity */
    Notification: Notification
    /** Notification type enum */
    NotificationType: NotificationType
    /** Notification filter option */
    NotificationFilter: NotificationFilter

    // ---------------------------------------------------------------------------
    // Review Domain
    // ---------------------------------------------------------------------------
    /** Review entity */
    Review: Review
    /** DTO for submitting a review */
    ReviewSubmit: ReviewSubmitData
    /** Pending review task */
    PendingReviewTask: PendingReviewTask
    /** Review block type */
    BlockType: BlockType
    /** Can create task API response */
    CanCreateTaskResponse: CanCreateTaskResponse

    // ---------------------------------------------------------------------------
    // Question Domain
    // ---------------------------------------------------------------------------
    /** Question entity */
    Question: Question
    /** Answer entity */
    Answer: Answer
    /** Question asker/answerer */
    QuestionUser: QuestionUser
    /** Question with answer included */
    QuestionWithAnswer: QuestionWithAnswer
    /** Question form input */
    QuestionFormData: QuestionFormData
    /** Answer form input */
    AnswerFormData: AnswerFormData
    /** Question statistics */
    QuestionStats: QuestionStats

    // ---------------------------------------------------------------------------
    // UI Component Types (for display/component props)
    // ---------------------------------------------------------------------------
    /** Professional data input (accepts both snake_case and camelCase) */
    ProfessionalData: ProfessionalDataInput
    /** Professional data transformed for UI display */
    ProfessionalDisplay: ProfessionalDisplayData
    /** Review item for ReviewsSection component */
    ReviewDisplay: ReviewDisplayItem
    /** Completed task item for CompletedTasksSection component */
    CompletedTaskDisplay: CompletedTaskDisplayItem
    /** Task item for TaskSelectionModal component */
    TaskSelection: TaskSelectionItem
    /** Service item for professional profile */
    Service: ServiceItem
  }

  /**
   * Helper type for accessing API types
   *
   * @example
   * function createUser(data: APIType<'UserCreate'>): APIType<'UserProfile'> {
   *   // ...
   * }
   */
  type APIType<K extends keyof API> = API[K]

  /**
   * Get all available API type keys
   *
   * @example
   * type Keys = APIKeys // 'UserProfile' | 'UserCreate' | 'Task' | ...
   */
  type APIKeys = keyof API
}

export {}
