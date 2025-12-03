/**
 * Task domain types
 * Defines the structure of tasks in the system
 */

/**
 * Input from create task form
 * This matches the frontend form structure
 */
export interface CreateTaskInput {
  // Required fields
  category: string
  title: string
  description: string
  city: string

  // Optional fields
  subcategory?: string
  neighborhood?: string
  requirements?: string

  // Budget (optional)
  budgetType?: 'fixed' | 'range' | 'unclear'
  budgetMin?: number
  budgetMax?: number

  // Timeline
  urgency?: 'same_day' | 'within_week' | 'flexible'
  deadline?: string // ISO date string

  // Media
  photoUrls?: string[]

  // Localization - for auto-translation
  sourceLocale?: string // Locale task was created in (en, bg, ru, ua)
}

/**
 * Input from edit task form
 * Same structure as CreateTaskInput but all fields are optional
 */
export interface UpdateTaskInput {
  // Task details
  category?: string
  subcategory?: string
  title?: string
  description?: string
  requirements?: string

  // Location
  city?: string
  neighborhood?: string

  // Budget
  budgetType?: 'fixed' | 'range' | 'unclear'
  budgetMin?: number
  budgetMax?: number

  // Timeline
  urgency?: 'same_day' | 'within_week' | 'flexible'
  deadline?: string // ISO date string

  // Media
  photoUrls?: string[]
}

/**
 * Task entity (database representation)
 */
export interface Task {
  id: string
  created_at: string
  updated_at: string

  // Task details
  title: string
  description: string
  category: string
  subcategory: string | null

  // Location
  city: string
  neighborhood: string | null
  location_notes: string | null

  // Budget
  budget_min_bgn: number | null
  budget_max_bgn: number | null
  budget_type: 'fixed' | 'hourly' | 'negotiable' | 'unclear'

  // Timeline
  deadline: string | null
  estimated_duration_hours: number | null

  // Status
  status: TaskStatus

  // Relationships
  customer_id: string
  selected_professional_id: string | null
  accepted_application_id: string | null

  // Completion tracking
  completed_at: string | null
  completed_by_professional_at: string | null
  confirmed_by_customer_at: string | null
  reviewed_by_customer: boolean
  reviewed_by_professional: boolean

  // Cancellation
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null

  // Media
  images: string[]
  documents: string[]

  // Metadata
  views_count: number
  applications_count: number
  is_urgent: boolean
  requires_license: boolean
  requires_insurance: boolean

  // Translation fields (one-way to Bulgarian)
  source_language: string // Locale task was created in (en, bg, ru, ua)
  title_bg: string | null // Bulgarian translation of title
  description_bg: string | null // Bulgarian translation of description
  requirements_bg: string | null // Bulgarian translation of requirements
}

/**
 * Task status enum
 */
export type TaskStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'pending_customer_confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed'

/**
 * Database insert type
 * Only includes fields needed for insertion
 */
export interface TaskDbInsert {
  title: string
  description: string
  category: string
  subcategory: string | null
  city: string
  neighborhood: string | null
  location_notes: string | null
  budget_min_bgn: number | null
  budget_max_bgn: number | null
  budget_type: 'fixed' | 'hourly' | 'negotiable' | 'unclear'
  deadline: string | null
  is_urgent: boolean
  status: TaskStatus
  customer_id: string
  images: string[]
  // Translation fields
  source_language: string
  title_bg?: string | null
  description_bg?: string | null
  requirements_bg?: string | null
}

/**
 * Task creation result
 * What we return from the API
 */
export interface CreateTaskResult {
  task: Task
}

/**
 * Map form urgency to database fields
 */
export const calculateDeadline = (
  urgency?: 'same_day' | 'within_week' | 'flexible',
  customDeadline?: string
): string | null => {
  if (customDeadline) {
    return new Date(customDeadline).toISOString()
  }

  if (!urgency || urgency === 'flexible') {
    return null
  }

  const now = new Date()

  switch (urgency) {
    case 'same_day':
      // End of today
      now.setHours(23, 59, 59, 999)
      return now.toISOString()

    case 'within_week':
      // 7 days from now
      now.setDate(now.getDate() + 7)
      return now.toISOString()

    default:
      return null
  }
}

/**
 * Map budget type from form to database
 */
export const mapBudgetType = (
  budgetType?: 'fixed' | 'range' | 'unclear'
): 'fixed' | 'hourly' | 'negotiable' | 'unclear' => {
  if (budgetType === 'fixed') {
    return 'fixed'
  }
  if (budgetType === 'unclear') {
    return 'unclear'
  }
  return 'negotiable'
}

/**
 * Map form input to database insert
 */
export const mapCreateInputToDbInsert = (
  input: CreateTaskInput,
  customerId: string
): TaskDbInsert => {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    subcategory: input.subcategory || null,
    city: input.city,
    neighborhood: input.neighborhood || null,
    location_notes: input.requirements || null,
    budget_min_bgn: input.budgetMin || null,
    budget_max_bgn: input.budgetMax || null,
    budget_type: mapBudgetType(input.budgetType),
    deadline: calculateDeadline(input.urgency, input.deadline),
    is_urgent: input.urgency === 'same_day',
    status: 'open',
    customer_id: customerId,
    images: input.photoUrls || [],
    source_language: input.sourceLocale || 'bg', // Default to BG if not specified
  }
}

/**
 * Map update input to database update
 * Only includes fields that are actually being updated
 */
export const mapUpdateInputToDbUpdate = (
  input: UpdateTaskInput
): Partial<Task> => {
  const updates: Partial<Task> = {}

  // Only add fields that are present in the input
  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.category !== undefined) updates.category = input.category
  if (input.subcategory !== undefined) updates.subcategory = input.subcategory || null
  if (input.city !== undefined) updates.city = input.city
  if (input.neighborhood !== undefined) updates.neighborhood = input.neighborhood || null
  if (input.requirements !== undefined) updates.location_notes = input.requirements || null

  // Budget fields
  if (input.budgetMin !== undefined) updates.budget_min_bgn = input.budgetMin || null
  if (input.budgetMax !== undefined) updates.budget_max_bgn = input.budgetMax || null
  if (input.budgetType !== undefined) updates.budget_type = mapBudgetType(input.budgetType)

  // Timeline fields
  if (input.urgency !== undefined || input.deadline !== undefined) {
    updates.deadline = calculateDeadline(input.urgency, input.deadline)
    updates.is_urgent = input.urgency === 'same_day'
  }

  // Media
  if (input.photoUrls !== undefined) updates.images = input.photoUrls

  return updates
}
