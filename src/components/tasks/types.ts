import { z } from 'zod'

/**
 * Application form data structure
 */
export interface ApplicationFormData {
  proposedPrice: number
  timeline: string
  message: string
}

/**
 * Zod validation schema for application form
 */
export const applicationFormSchema = z.object({
  proposedPrice: z
    .number({
      required_error: 'application.errors.priceRequired',
      invalid_type_error: 'application.errors.priceRequired',
    })
    .positive({
      message: 'application.errors.priceMin',
    }),

  timeline: z
    .string({
      required_error: 'application.errors.timelineRequired',
    })
    .min(1, {
      message: 'application.errors.timelineRequired',
    }),

  message: z
    .string({
      required_error: 'application.errors.messageRequired',
    })
    .min(50, {
      message: 'application.errors.messageMin',
    })
    .max(500, {
      message: 'application.errors.messageMax',
    }),
})

/**
 * Timeline options for the select dropdown
 */
export const TIMELINE_OPTIONS = [
  'today',
  'within-week',
  'flexible',
] as const

export type TimelineOption = typeof TIMELINE_OPTIONS[number]

/**
 * Application status types - imported from central types
 */
import type { ApplicationStatus } from '@/types/applications'

// Re-export for convenience
export type { ApplicationStatus }

/**
 * Application submission response
 */
export interface ApplicationSubmissionResponse {
  success: boolean
  applicationId: string
  message: string
}
