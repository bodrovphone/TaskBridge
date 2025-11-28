/**
 * Task Service
 * Business logic for task operations
 */

import { TaskRepository } from './task.repository'
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  canUserCreateTask,
  validateImageUrls
} from './task.validation'
import { mapCreateInputToDbInsert, mapUpdateInputToDbUpdate } from './task.types'
import { Result, ok, err } from '../shared/result'
import { ValidationError, DatabaseError, ForbiddenError, NotFoundError } from '../shared/errors'
import type { CreateTaskInput, UpdateTaskInput, Task, CreateTaskResult } from './task.types'
import { translateTaskToBulgarian } from '@/lib/services/translation'

export class TaskService {
  private repository: TaskRepository

  constructor() {
    this.repository = new TaskRepository()
  }

  /**
   * Create a new task
   *
   * Business flow:
   * 1. Validate input data
   * 2. Check if user can create task (business rules)
   * 3. Validate image URLs if provided
   * 4. Map input to database format
   * 5. Save to database
   * 6. Return created task
   */
  async createTask(
    input: CreateTaskInput,
    userId: string
  ): Promise<Result<CreateTaskResult, ValidationError | DatabaseError>> {
    // 1. Validate input
    const validationResult = validateCreateTaskInput(input)
    if (!validationResult.success) {
      return err(validationResult.error)
    }
    const validatedInput = validationResult.data

    // 2. Check business rules
    const canCreateResult = await canUserCreateTask(userId)
    if (!canCreateResult.success) {
      return err(canCreateResult.error)
    }

    // 3. Validate image URLs if provided
    if (validatedInput.photoUrls && validatedInput.photoUrls.length > 0) {
      const imageValidation = validateImageUrls(validatedInput.photoUrls)
      if (!imageValidation.success) {
        return err(imageValidation.error)
      }
    }

    // 4. Map to database format
    const dbInsert = mapCreateInputToDbInsert(validatedInput, userId)

    // 5. Save to database first (instant response for user)
    const createResult = await this.repository.create(dbInsert)
    if (!createResult.success) {
      return err(createResult.error)
    }

    // 6. Translate async in background (fire-and-forget) if source is not BG
    if (dbInsert.source_language !== 'bg') {
      this.translateTaskInBackground(
        createResult.data.id,
        validatedInput.title,
        validatedInput.description,
        validatedInput.requirements || null,
        dbInsert.source_language
      )
    }

    // 7. Return result immediately (don't wait for translation)
    return ok({
      task: createResult.data
    })
  }

  /**
   * Translate task content in background and update database
   * Fire-and-forget pattern - errors are logged but don't affect user
   */
  private translateTaskInBackground(
    taskId: string,
    title: string,
    description: string,
    requirements: string | null,
    sourceLocale: string
  ): void {
    // Don't await - let it run in background
    (async () => {
      try {
        console.log(`[TaskService] Starting background translation for task ${taskId}`)

        const translations = await translateTaskToBulgarian({
          title,
          description,
          requirements,
          sourceLocale,
        })

        // Only update if we got translations
        const updates: Partial<Task> = {}
        if (translations.title_bg) updates.title_bg = translations.title_bg
        if (translations.description_bg) updates.description_bg = translations.description_bg
        if (translations.requirements_bg) updates.requirements_bg = translations.requirements_bg

        if (Object.keys(updates).length > 0) {
          const updateResult = await this.repository.update(taskId, updates)
          if (updateResult.success) {
            console.log(`[TaskService] Background translation completed for task ${taskId}`)
          } else {
            console.error(`[TaskService] Failed to save translations for task ${taskId}:`, updateResult.error)
          }
        } else {
          console.warn(`[TaskService] No translations returned for task ${taskId}`)
        }
      } catch (error) {
        console.error(`[TaskService] Background translation failed for task ${taskId}:`, error)
      }
    })()
  }

  /**
   * Get task by ID
   */
  async getTaskById(
    id: string
  ): Promise<Result<Task | null, DatabaseError>> {
    return await this.repository.findById(id)
  }

  /**
   * Get tasks by customer
   */
  async getCustomerTasks(
    customerId: string
  ): Promise<Result<Task[], DatabaseError>> {
    return await this.repository.findByCustomerId(customerId)
  }

  /**
   * Get open tasks (for browse page)
   */
  async getOpenTasks(
    limit = 20
  ): Promise<Result<Task[], DatabaseError>> {
    return await this.repository.findOpenTasks(limit)
  }

  /**
   * Get featured tasks (high-quality tasks with diversity)
   */
  async getFeaturedTasks(): Promise<Result<Task[], DatabaseError>> {
    return await this.repository.findFeaturedTasks()
  }

  /**
   * Update task
   *
   * Business flow:
   * 1. Validate input data
   * 2. Check if task exists
   * 3. Verify user is the task owner (authorization)
   * 4. Map input to database format
   * 5. Update in database
   * 6. Return updated task
   */
  async updateTask(
    id: string,
    input: UpdateTaskInput,
    userId: string
  ): Promise<Result<Task, DatabaseError | ValidationError | ForbiddenError | NotFoundError>> {
    // 1. Validate input
    const validationResult = validateUpdateTaskInput(input)
    if (!validationResult.success) {
      return err(validationResult.error)
    }
    const validatedInput = validationResult.data

    // 2. Check if task exists
    const taskResult = await this.repository.findById(id)
    if (!taskResult.success) {
      return err(taskResult.error)
    }

    const task = taskResult.data
    if (!task) {
      return err(new NotFoundError('Task', id))
    }

    // 3. Authorization check - only owner can update
    if (task.customer_id !== userId) {
      return err(
        new ForbiddenError(
          'You do not have permission to update this task'
        )
      )
    }

    // 4. Validate image URLs if provided
    if (validatedInput.photoUrls && validatedInput.photoUrls.length > 0) {
      const imageValidation = validateImageUrls(validatedInput.photoUrls)
      if (!imageValidation.success) {
        return err(imageValidation.error)
      }
    }

    // 5. Map to database format
    const dbUpdates = mapUpdateInputToDbUpdate(validatedInput)

    // 6. Update in database first (instant response for user)
    const updateResult = await this.repository.update(id, dbUpdates)
    if (!updateResult.success) {
      return err(updateResult.error)
    }

    // 7. Re-translate async in background if source was non-BG and content fields changed
    if (task.source_language !== 'bg') {
      const contentChanged =
        validatedInput.title !== undefined ||
        validatedInput.description !== undefined ||
        validatedInput.requirements !== undefined

      if (contentChanged) {
        // Use new values if provided, otherwise use existing task values
        this.translateTaskInBackground(
          id,
          validatedInput.title ?? task.title,
          validatedInput.description ?? task.description,
          validatedInput.requirements ?? task.location_notes ?? null,
          task.source_language
        )
      }
    }

    // 8. Return updated task immediately (don't wait for translation)
    return ok(updateResult.data)
  }

  /**
   * Cancel task
   * Future: Add business rules for cancellation
   */
  async cancelTask(
    id: string,
    userId: string,
    reason?: string
  ): Promise<Result<void, DatabaseError | ValidationError>> {
    // TODO: Add authorization check
    // TODO: Add business rules (can only cancel if no accepted applications, etc.)

    return await this.repository.delete(id)
  }

  /**
   * Get tasks with filtering, sorting, and pagination
   */
  async getTasks(
    params: import('./task.query-types').TaskQueryParams,
    viewerId?: string
  ): Promise<Result<import('./task.query-types').PaginatedTasksResponse<Task>, ValidationError | DatabaseError>> {
    // 1. Parse and validate query
    const { parseTaskQuery } = await import('./task.query-parser')
    const parseResult = parseTaskQuery(params)
    if (!parseResult.success) {
      return err(parseResult.error)
    }
    const options = parseResult.data

    // 2. Add viewerId for privacy filtering
    options.viewerId = viewerId

    // 3. Execute query
    const result = await this.repository.findMany(options)

    if (!result.success) {
      return err(result.error)
    }

    // 4. Apply privacy filtering
    const { applyPrivacyFilterBulk } = await import('./task.privacy')
    const filteredTasks = applyPrivacyFilterBulk(
      result.data.tasks,
      viewerId
    )

    // 5. Return response
    return ok({
      tasks: filteredTasks,
      pagination: result.data.pagination
    })
  }

  /**
   * Get single task by ID with privacy filtering
   */
  async getTaskDetail(
    id: string,
    viewerId?: string
  ): Promise<Result<import('./task.query-types').TaskDetailResponse<Task>, DatabaseError | import('../shared/errors').NotFoundError>> {
    // 1. Get task with relations
    const result = await this.repository.findByIdWithRelations(id)

    if (!result.success) {
      return err(result.error)
    }

    if (!result.data) {
      const { NotFoundError } = await import('../shared/errors')
      return err(new NotFoundError('Task', id))
    }

    const task = result.data

    // 2. Apply privacy filter
    const { applyPrivacyFilter } = await import('./task.privacy')
    const filteredTask = applyPrivacyFilter(task, viewerId)

    // 3. Build response with metadata
    return ok({
      task: filteredTask,
      relatedData: {
        applicationsCount: task.applicationsCount,
        isOwner: task.customer_id === viewerId,
        // Future: add userHasApplied check
      }
    })
  }
}
