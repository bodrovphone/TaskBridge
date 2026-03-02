import { z } from 'zod'

/**
 * Validation schema for task creation form
 * Based on database schema and business requirements
 */
export const createTaskSchema = z.object({
  // Category
  category: z.string().min(1, 'createTask.errors.categoryRequired'),
  subcategory: z.string().optional(),

  // Details
  title: z.string()
    .min(10, 'createTask.errors.titleTooShort')
    .max(200, 'createTask.errors.titleTooLong'),
  description: z.string()
    .min(15, 'createTask.errors.descriptionTooShort')
    .max(600, 'createTask.errors.descriptionTooLong'),
  requirements: z.string().optional(),

  // Location
  city: z.string().min(1, 'createTask.errors.cityRequired'),
  neighborhood: z.string().nullable().optional().transform(val => val || undefined),

  // Budget (completely optional)
  budgetType: z.enum(['fixed', 'range', 'unclear']).optional().default('unclear'),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),

  // Timeline
  urgency: z.enum(['same_day', 'within_week', 'flexible']).default('flexible'),
  deadline: z.date()
    .optional()
    .refine(
      (date) => {
        // If no deadline provided, it's valid
        if (!date) return true
        // Deadline must be today or in the future (set to start of day for comparison)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const deadlineDate = new Date(date)
        deadlineDate.setHours(0, 0, 0, 0)
        return deadlineDate >= today
      },
      {
        message: 'createTask.errors.deadlineInPast'
      }
    ),

  // Photos
  photos: z.array(z.string()).max(5, 'createTask.errors.tooManyPhotos').default([]),
}).refine(
  (data) => {
    // If budgetType is 'range' and both values are provided, ensure budgetMax > budgetMin
    if (data.budgetType === 'range' && data.budgetMin && data.budgetMax) {
      return data.budgetMax > data.budgetMin
    }
    // Budget is optional, so if not provided, it's valid
    return true
  },
  {
    message: 'createTask.errors.budgetInvalid',
    path: ['budgetMax']
  }
)

export type CreateTaskFormData = z.infer<typeof createTaskSchema>

/**
 * Default form values
 */
export const defaultFormValues: Partial<CreateTaskFormData> & {
  photoFile?: File | null
  imageOversized?: boolean
} = {
  category: '',
  subcategory: '',
  title: '',
  description: '',
  requirements: '',
  city: '',
  neighborhood: '',
  budgetType: 'unclear',
  urgency: 'flexible',
  photos: [],
  photoFile: null, // Temporary storage for file upload (not sent to API)
  imageOversized: false, // Flag to track if selected image is too large
}

/**
 * Bulgarian cities for dropdown
 */
export const BULGARIAN_CITIES = [
  'София',
  'Пловдив',
  'Варна',
  'Бургас',
  'Русе',
  'Стара Загора',
  'Плевен',
  'Сливен',
  'Добрич',
  'Шумен',
  'Перник',
  'Хасково',
  'Ямбол',
  'Пазарджик',
  'Благоевград',
  'Велико Търново',
  'Враца',
  'Габрово',
  'Асеновград',
  'Видин',
  'Казанлък',
  'Кърджали',
  'Кюстендил',
  'Монтана',
  'Търговище',
] as const

/**
 * Task categories matching database schema
 */
export const TASK_CATEGORIES = [
  { value: 'home_repair', labelKey: 'taskCard.category.home_repair', icon: '🏠' },
  { value: 'delivery_transport', labelKey: 'taskCard.category.delivery_transport', icon: '🚚' },
  { value: 'personal_care', labelKey: 'taskCard.category.personal_care', icon: '🐕' },
  { value: 'personal_assistant', labelKey: 'taskCard.category.personal_assistant', icon: '👤' },
  { value: 'learning_fitness', labelKey: 'taskCard.category.learning_fitness', icon: '🎓' },
  { value: 'other', labelKey: 'taskCard.category.other', icon: '📦' },
] as const
