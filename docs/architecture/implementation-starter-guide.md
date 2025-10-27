# Universal Backend - Implementation Starter Guide

## Quick Start: Implementing Your First Entity (Task)

This guide shows practical, copy-paste examples to get started with the universal backend architecture.

---

## Step 1: Create Base Utilities

### 1.1 Result Type (Error Handling)

```typescript
// /src/server/shared/types/result.type.ts

export class Result<T, E extends Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T, E extends Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined)
  }

  static error<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error)
  }

  isOk(): boolean {
    return this._error === undefined
  }

  isError(): boolean {
    return this._error !== undefined
  }

  get value(): T {
    if (this.isError()) {
      throw new Error('Cannot get value of error result')
    }
    return this._value!
  }

  get error(): E {
    if (this.isOk()) {
      throw new Error('Cannot get error of success result')
    }
    return this._error!
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isError()) {
      return Result.error(this._error!)
    }
    return Result.ok(fn(this._value!))
  }

  mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    if (this.isOk()) {
      return Result.ok(this._value!)
    }
    return Result.error(fn(this._error!))
  }
}
```

### 1.2 Base Error Classes

```typescript
// /src/server/shared/errors/base.error.ts

export abstract class ApplicationError extends Error {
  abstract statusCode: number

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// /src/server/shared/errors/validation.error.ts
export class ValidationError extends ApplicationError {
  statusCode = 400

  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message)
  }
}

// /src/server/shared/errors/not-found.error.ts
export class NotFoundError extends ApplicationError {
  statusCode = 404

  constructor(message: string) {
    super(message)
  }
}

// /src/server/shared/errors/unauthorized.error.ts
export class UnauthorizedError extends ApplicationError {
  statusCode = 401

  constructor(message: string) {
    super(message)
  }
}

// /src/server/shared/errors/business.error.ts
export class BusinessRuleError extends ApplicationError {
  statusCode = 422

  constructor(message: string) {
    super(message)
  }
}
```

---

## Step 2: Domain Layer (Task Entity)

### 2.1 Task Types

```typescript
// /src/server/domain/task/task.types.ts

export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'pending_customer_confirmation'
  | 'pending_professional_confirmation'
  | 'completed'
  | 'cancelled'

export type TaskCategory =
  | 'home_repair'
  | 'delivery'
  | 'personal_care'
  | 'personal_assistant'
  | 'learning_fitness'
  | 'other'

export type TaskUrgency = 'same_day' | 'within_week' | 'flexible'

export interface Money {
  amount: number
  currency: string
}

export interface Location {
  city: string
  neighborhood?: string
  address?: string
  latitude?: number
  longitude?: number
}
```

### 2.2 Task Entity

```typescript
// /src/server/domain/task/task.entity.ts

import { BusinessRuleError } from '@/server/shared/errors/business.error'
import { ValidationError } from '@/server/shared/errors/validation.error'
import { Result } from '@/server/shared/types/result.type'
import type { TaskStatus, TaskCategory, TaskUrgency, Money, Location } from './task.types'

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public category: TaskCategory,
    public status: TaskStatus,
    public createdBy: string,
    public budget: Money,
    public location: Location,
    public urgency: TaskUrgency,
    public deadline?: Date,
    public assignedTo?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method for creating new tasks
  static create(
    data: {
      title: string
      description: string
      category: TaskCategory
      budget: Money
      location: Location
      urgency: TaskUrgency
      deadline?: Date
    },
    createdBy: string
  ): Task {
    return new Task(
      crypto.randomUUID(), // Generate ID
      data.title,
      data.description,
      data.category,
      'open', // Initial status
      createdBy,
      data.budget,
      data.location,
      data.urgency,
      data.deadline
    )
  }

  // Business logic: Validate task data
  validate(): Result<void, ValidationError> {
    const errors: Record<string, string[]> = {}

    if (!this.title || this.title.length < 5) {
      errors.title = ['Title must be at least 5 characters']
    }

    if (!this.description || this.description.length < 20) {
      errors.description = ['Description must be at least 20 characters']
    }

    if (this.budget.amount <= 0) {
      errors.budget = ['Budget must be greater than 0']
    }

    if (!this.location.city) {
      errors.location = ['City is required']
    }

    if (this.deadline && this.deadline < new Date()) {
      errors.deadline = ['Deadline cannot be in the past']
    }

    if (Object.keys(errors).length > 0) {
      return Result.error(new ValidationError('Validation failed', errors))
    }

    return Result.ok(undefined)
  }

  // Business logic: Can this task be accepted?
  canBeAccepted(): boolean {
    return this.status === 'open'
  }

  // Business logic: Accept an application
  accept(professionalId: string): Result<void, BusinessRuleError> {
    if (!this.canBeAccepted()) {
      return Result.error(
        new BusinessRuleError('Task must be open to accept an application')
      )
    }

    this.status = 'in_progress'
    this.assignedTo = professionalId
    this.updatedAt = new Date()

    return Result.ok(undefined)
  }

  // Business logic: Mark as completed (by professional)
  complete(): Result<void, BusinessRuleError> {
    if (this.status !== 'in_progress') {
      return Result.error(
        new BusinessRuleError('Task must be in progress to mark as complete')
      )
    }

    this.status = 'pending_customer_confirmation'
    this.updatedAt = new Date()

    return Result.ok(undefined)
  }

  // Business logic: Customer confirms completion
  confirmCompletion(): Result<void, BusinessRuleError> {
    if (this.status !== 'pending_customer_confirmation') {
      return Result.error(
        new BusinessRuleError('Task must be pending customer confirmation')
      )
    }

    this.status = 'completed'
    this.updatedAt = new Date()

    return Result.ok(undefined)
  }

  // Business logic: Customer rejects completion
  rejectCompletion(reason: string): Result<void, BusinessRuleError> {
    if (this.status !== 'pending_customer_confirmation') {
      return Result.error(
        new BusinessRuleError('Task must be pending customer confirmation')
      )
    }

    this.status = 'in_progress' // Return to in_progress
    this.updatedAt = new Date()

    return Result.ok(undefined)
  }

  // Business logic: Cancel task
  cancel(): Result<void, BusinessRuleError> {
    if (this.status === 'completed') {
      return Result.error(
        new BusinessRuleError('Cannot cancel completed task')
      )
    }

    this.status = 'cancelled'
    this.assignedTo = undefined
    this.updatedAt = new Date()

    return Result.ok(undefined)
  }

  // Check if task is owned by user
  isOwnedBy(userId: string): boolean {
    return this.createdBy === userId
  }

  // Check if task is assigned to professional
  isAssignedTo(professionalId: string): boolean {
    return this.assignedTo === professionalId
  }
}
```

### 2.3 Task Business Rules

```typescript
// /src/server/domain/task/task.rules.ts

import { BusinessRuleError } from '@/server/shared/errors/business.error'
import { Result } from '@/server/shared/types/result.type'
import type { Task } from './task.entity'

export class TaskCreationRules {
  /**
   * Check if customer can create a new task based on their existing tasks
   * Implements PRD requirements for task creation constraints
   */
  static canCustomerCreateTask(existingTasks: Task[]): Result<void, BusinessRuleError> {
    // Priority 1: HARD BLOCK - Pending customer confirmations
    const pendingConfirmations = existingTasks.filter(
      task => task.status === 'pending_customer_confirmation'
    )

    if (pendingConfirmations.length > 0) {
      return Result.error(
        new BusinessRuleError(
          'You must confirm or reject pending task completions before creating new tasks'
        )
      )
    }

    // Priority 2: SOFT BLOCK - Missing reviews (will implement with Review entity)
    // @todo FEATURE: Implement review check after Review entity is created
    const completedWithoutReview = existingTasks.filter(
      task => task.status === 'completed' // && !task.reviewedByCustomer
    )

    const REVIEW_GRACE_PERIOD = 3
    if (completedWithoutReview.length >= REVIEW_GRACE_PERIOD) {
      return Result.error(
        new BusinessRuleError(
          'You must submit reviews for completed tasks before creating more'
        )
      )
    }

    // Priority 3: Tasks in progress - no block, but show soft warning if > 5
    const inProgress = existingTasks.filter(
      task => task.status === 'in_progress'
    )

    // Note: We don't block here, but controller can show warning
    if (inProgress.length > 5) {
      // Log or return warning metadata
      console.warn(`User has ${inProgress.length} tasks in progress`)
    }

    return Result.ok(undefined)
  }

  /**
   * Check if task budget is reasonable for category
   */
  static validateBudgetForCategory(
    category: string,
    budget: number
  ): Result<void, BusinessRuleError> {
    const MIN_BUDGETS: Record<string, number> = {
      home_repair: 50,
      delivery: 10,
      personal_care: 20,
      personal_assistant: 15,
      learning_fitness: 30,
      other: 10
    }

    const minBudget = MIN_BUDGETS[category] || 10

    if (budget < minBudget) {
      return Result.error(
        new BusinessRuleError(
          `Minimum budget for ${category} is ${minBudget} BGN`
        )
      )
    }

    return Result.ok(undefined)
  }
}

export class TaskCompletionRules {
  /**
   * Check if professional can mark task as complete
   */
  static canProfessionalComplete(task: Task, professionalId: string): Result<void, BusinessRuleError> {
    if (!task.isAssignedTo(professionalId)) {
      return Result.error(
        new BusinessRuleError('Only assigned professional can complete this task')
      )
    }

    if (task.status !== 'in_progress') {
      return Result.error(
        new BusinessRuleError('Task must be in progress to complete')
      )
    }

    return Result.ok(undefined)
  }

  /**
   * Check if customer can confirm completion
   */
  static canCustomerConfirm(task: Task, customerId: string): Result<void, BusinessRuleError> {
    if (!task.isOwnedBy(customerId)) {
      return Result.error(
        new BusinessRuleError('Only task owner can confirm completion')
      )
    }

    if (task.status !== 'pending_customer_confirmation') {
      return Result.error(
        new BusinessRuleError('Task must be pending customer confirmation')
      )
    }

    return Result.ok(undefined)
  }
}
```

---

## Step 3: Infrastructure Layer (Repository)

### 3.1 Repository Interface

```typescript
// /src/server/application/tasks/ports/task-repository.interface.ts

import type { Task } from '@/server/domain/task/task.entity'
import type { TaskStatus, TaskCategory } from '@/server/domain/task/task.types'

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>
  findByUserId(userId: string): Promise<Task[]>
  findByStatus(status: TaskStatus): Promise<Task[]>
  findByCategory(category: TaskCategory): Promise<Task[]>
  findOpenTasks(filters?: TaskFilters): Promise<Task[]>
  save(task: Task): Promise<Task>
  update(task: Task): Promise<Task>
  delete(id: string): Promise<void>
}

export interface TaskFilters {
  city?: string
  category?: TaskCategory
  minBudget?: number
  maxBudget?: number
  urgency?: string
}
```

### 3.2 Repository Implementation (Drizzle)

```typescript
// /src/server/infrastructure/database/repositories/task.repository.ts

import { eq, and, gte, lte } from 'drizzle-orm'
import { db } from '@/database/drizzle' // Your existing Drizzle connection
import { tasks } from '@/database/schema' // Your existing schema
import type { ITaskRepository, TaskFilters } from '@/server/application/tasks/ports/task-repository.interface'
import { Task } from '@/server/domain/task/task.entity'
import { TaskMapper } from '../mappers/task.mapper'

export class DrizzleTaskRepository implements ITaskRepository {
  async findById(id: string): Promise<Task | null> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id))
    return row ? TaskMapper.toDomain(row) : null
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.createdBy, userId))
      .orderBy(tasks.createdAt)

    return rows.map(TaskMapper.toDomain)
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .orderBy(tasks.createdAt)

    return rows.map(TaskMapper.toDomain)
  }

  async findByCategory(category: TaskCategory): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.category, category))
      .orderBy(tasks.createdAt)

    return rows.map(TaskMapper.toDomain)
  }

  async findOpenTasks(filters?: TaskFilters): Promise<Task[]> {
    let query = db.select().from(tasks).where(eq(tasks.status, 'open'))

    if (filters?.city) {
      query = query.where(eq(tasks.city, filters.city))
    }

    if (filters?.category) {
      query = query.where(eq(tasks.category, filters.category))
    }

    if (filters?.minBudget) {
      query = query.where(gte(tasks.budgetAmount, filters.minBudget))
    }

    if (filters?.maxBudget) {
      query = query.where(lte(tasks.budgetAmount, filters.maxBudget))
    }

    const rows = await query.orderBy(tasks.createdAt)
    return rows.map(TaskMapper.toDomain)
  }

  async save(task: Task): Promise<Task> {
    const data = TaskMapper.toPersistence(task)
    await db.insert(tasks).values(data)
    return task
  }

  async update(task: Task): Promise<Task> {
    const data = TaskMapper.toPersistence(task)
    await db.update(tasks).set(data).where(eq(tasks.id, task.id))
    return task
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id))
  }
}
```

### 3.3 Domain ↔ Database Mapper

```typescript
// /src/server/infrastructure/database/mappers/task.mapper.ts

import type { Task as DbTask } from '@/database/schema'
import { Task } from '@/server/domain/task/task.entity'
import type { TaskStatus, TaskCategory, TaskUrgency } from '@/server/domain/task/task.types'

export class TaskMapper {
  /**
   * Convert database row to domain entity
   */
  static toDomain(raw: DbTask): Task {
    return new Task(
      raw.id,
      raw.title,
      raw.description,
      raw.category as TaskCategory,
      raw.status as TaskStatus,
      raw.createdBy,
      {
        amount: raw.budgetAmount,
        currency: raw.budgetCurrency
      },
      {
        city: raw.city,
        neighborhood: raw.neighborhood,
        address: raw.address,
        latitude: raw.latitude,
        longitude: raw.longitude
      },
      raw.urgency as TaskUrgency,
      raw.deadline ? new Date(raw.deadline) : undefined,
      raw.assignedTo,
      new Date(raw.createdAt),
      new Date(raw.updatedAt)
    )
  }

  /**
   * Convert domain entity to database row
   */
  static toPersistence(task: Task): Omit<DbTask, 'createdAt' | 'updatedAt'> {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      createdBy: task.createdBy,
      budgetAmount: task.budget.amount,
      budgetCurrency: task.budget.currency,
      city: task.location.city,
      neighborhood: task.location.neighborhood || null,
      address: task.location.address || null,
      latitude: task.location.latitude || null,
      longitude: task.location.longitude || null,
      urgency: task.urgency,
      deadline: task.deadline?.toISOString() || null,
      assignedTo: task.assignedTo || null
    }
  }
}
```

---

## Step 4: Application Layer (Service)

### 4.1 Task Service

```typescript
// /src/server/application/tasks/task.service.ts

import type { ITaskRepository } from './ports/task-repository.interface'
import { Task } from '@/server/domain/task/task.entity'
import { TaskCreationRules, TaskCompletionRules } from '@/server/domain/task/task.rules'
import { NotFoundError } from '@/server/shared/errors/not-found.error'
import { UnauthorizedError } from '@/server/shared/errors/unauthorized.error'
import { Result } from '@/server/shared/types/result.type'
import type { TaskCategory, TaskUrgency, Money, Location } from '@/server/domain/task/task.types'

export interface CreateTaskDto {
  title: string
  description: string
  category: TaskCategory
  budget: Money
  location: Location
  urgency: TaskUrgency
  deadline?: Date
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  budget?: Money
  deadline?: Date
}

export class TaskService {
  constructor(
    private taskRepository: ITaskRepository
    // private notificationService: INotificationService // Future
  ) {}

  /**
   * Create a new task
   */
  async createTask(
    dto: CreateTaskDto,
    userId: string
  ): Promise<Result<Task, Error>> {
    // 1. Check business rules - can user create task?
    const userTasks = await this.taskRepository.findByUserId(userId)
    const canCreate = TaskCreationRules.canCustomerCreateTask(userTasks)

    if (canCreate.isError()) {
      return canCreate
    }

    // 2. Check budget rules
    const budgetCheck = TaskCreationRules.validateBudgetForCategory(
      dto.category,
      dto.budget.amount
    )

    if (budgetCheck.isError()) {
      return budgetCheck
    }

    // 3. Create domain entity
    const task = Task.create(dto, userId)

    // 4. Validate entity
    const validation = task.validate()
    if (validation.isError()) {
      return validation
    }

    // 5. Persist
    const saved = await this.taskRepository.save(task)

    // 6. Side effects (notifications, etc.)
    // await this.notificationService.notifyNewTask(task)

    return Result.ok(saved)
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Result<Task, Error>> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      return Result.error(new NotFoundError('Task not found'))
    }

    return Result.ok(task)
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findByUserId(userId)
  }

  /**
   * Browse open tasks with filters
   */
  async browseOpenTasks(filters?: any): Promise<Task[]> {
    return this.taskRepository.findOpenTasks(filters)
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    dto: UpdateTaskDto,
    userId: string
  ): Promise<Result<Task, Error>> {
    const task = await this.taskRepository.findById(taskId)

    if (!task) {
      return Result.error(new NotFoundError('Task not found'))
    }

    if (!task.isOwnedBy(userId)) {
      return Result.error(new UnauthorizedError('Not authorized to update this task'))
    }

    // Update fields
    if (dto.title) task.title = dto.title
    if (dto.description) task.description = dto.description
    if (dto.budget) task.budget = dto.budget
    if (dto.deadline !== undefined) task.deadline = dto.deadline

    // Validate
    const validation = task.validate()
    if (validation.isError()) {
      return validation
    }

    // Persist
    const updated = await this.taskRepository.update(task)

    return Result.ok(updated)
  }

  /**
   * Complete task (professional action)
   */
  async completeTask(
    taskId: string,
    professionalId: string
  ): Promise<Result<Task, Error>> {
    const task = await this.taskRepository.findById(taskId)

    if (!task) {
      return Result.error(new NotFoundError('Task not found'))
    }

    // Check business rules
    const canComplete = TaskCompletionRules.canProfessionalComplete(task, professionalId)
    if (canComplete.isError()) {
      return canComplete
    }

    // Execute business logic
    const result = task.complete()
    if (result.isError()) {
      return result
    }

    // Persist
    const updated = await this.taskRepository.update(task)

    // Notify customer
    // await this.notificationService.notifyCustomer(task.createdBy, ...)

    return Result.ok(updated)
  }

  /**
   * Confirm task completion (customer action)
   */
  async confirmCompletion(
    taskId: string,
    customerId: string
  ): Promise<Result<Task, Error>> {
    const task = await this.taskRepository.findById(taskId)

    if (!task) {
      return Result.error(new NotFoundError('Task not found'))
    }

    // Check business rules
    const canConfirm = TaskCompletionRules.canCustomerConfirm(task, customerId)
    if (canConfirm.isError()) {
      return canConfirm
    }

    // Execute business logic
    const result = task.confirmCompletion()
    if (result.isError()) {
      return result
    }

    // Persist
    const updated = await this.taskRepository.update(task)

    // Notify professional
    // await this.notificationService.notifyProfessional(task.assignedTo, ...)

    return Result.ok(updated)
  }

  /**
   * Reject task completion (customer action)
   */
  async rejectCompletion(
    taskId: string,
    customerId: string,
    reason: string
  ): Promise<Result<Task, Error>> {
    const task = await this.taskRepository.findById(taskId)

    if (!task) {
      return Result.error(new NotFoundError('Task not found'))
    }

    if (!task.isOwnedBy(customerId)) {
      return Result.error(new UnauthorizedError('Not authorized'))
    }

    // Execute business logic
    const result = task.rejectCompletion(reason)
    if (result.isError()) {
      return result
    }

    // Persist
    const updated = await this.taskRepository.update(task)

    // Notify professional
    // await this.notificationService.notifyProfessional(task.assignedTo, ...)

    return Result.ok(updated)
  }
}
```

---

## Step 5: API Layer (Next.js)

### 5.1 Dependency Injection Container

```typescript
// /src/server/container.ts

import { DrizzleTaskRepository } from './infrastructure/database/repositories/task.repository'
import { TaskService } from './application/tasks/task.service'
import { db } from '@/database/drizzle' // Your existing connection

class Container {
  private instances = new Map<string, any>()

  register<T>(name: string, factory: () => T): void {
    this.instances.set(name, factory)
  }

  resolve<T>(name: string): T {
    const factory = this.instances.get(name)
    if (!factory) {
      throw new Error(`Service ${name} not registered in container`)
    }
    // Call factory to create instance (or return cached instance)
    return factory()
  }
}

export const container = new Container()

// Register repositories
container.register('TaskRepository', () => new DrizzleTaskRepository())

// Register services
container.register('TaskService', () => {
  const taskRepository = container.resolve('TaskRepository')
  return new TaskService(taskRepository)
})
```

### 5.2 Request Validators (Zod)

```typescript
// /src/server/api/validators/task.validators.ts

import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum([
    'home_repair',
    'delivery',
    'personal_care',
    'personal_assistant',
    'learning_fitness',
    'other'
  ]),
  budget: z.object({
    amount: z.number().positive('Budget must be positive'),
    currency: z.string().default('BGN')
  }),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }),
  urgency: z.enum(['same_day', 'within_week', 'flexible']),
  deadline: z.string().datetime().optional()
})

export const updateTaskSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  budget: z.object({
    amount: z.number().positive(),
    currency: z.string()
  }).optional(),
  deadline: z.string().datetime().optional()
})
```

### 5.3 Next.js API Routes

```typescript
// /src/app/api/tasks/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/server/container'
import { TaskService } from '@/server/application/tasks/task.service'
import { createTaskSchema } from '@/server/api/validators/task.validators'
import { ApplicationError } from '@/server/shared/errors/base.error'

/**
 * GET /api/tasks - Get all tasks (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const taskService = container.resolve<TaskService>('TaskService')

    if (userId) {
      const tasks = await taskService.getUserTasks(userId)
      return NextResponse.json(tasks)
    }

    if (status === 'open') {
      const tasks = await taskService.browseOpenTasks()
      return NextResponse.json(tasks)
    }

    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json()

    // 2. Validate input
    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    // 3. Get user ID (from auth - placeholder for now)
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // 4. Call service
    const taskService = container.resolve<TaskService>('TaskService')
    const result = await taskService.createTask(validation.data, userId)

    // 5. Handle result
    if (result.isError()) {
      const error = result.error

      if (error instanceof ApplicationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // 6. Return success
    return NextResponse.json(result.value, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

```typescript
// /src/app/api/tasks/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/server/container'
import { TaskService } from '@/server/application/tasks/task.service'
import { updateTaskSchema } from '@/server/api/validators/task.validators'
import { ApplicationError } from '@/server/shared/errors/base.error'

/**
 * GET /api/tasks/:id - Get task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskService = container.resolve<TaskService>('TaskService')
    const result = await taskService.getTaskById(params.id)

    if (result.isError()) {
      const error = result.error
      if (error instanceof ApplicationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error('GET /api/tasks/:id error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/tasks/:id - Update task
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validation = updateTaskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const taskService = container.resolve<TaskService>('TaskService')
    const result = await taskService.updateTask(params.id, validation.data, userId)

    if (result.isError()) {
      const error = result.error
      if (error instanceof ApplicationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error('PATCH /api/tasks/:id error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

```typescript
// /src/app/api/tasks/[id]/complete/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/server/container'
import { TaskService } from '@/server/application/tasks/task.service'
import { ApplicationError } from '@/server/shared/errors/base.error'

/**
 * POST /api/tasks/:id/complete - Mark task as complete (professional)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const professionalId = request.headers.get('x-user-id') || 'mock-professional-id'

    const taskService = container.resolve<TaskService>('TaskService')
    const result = await taskService.completeTask(params.id, professionalId)

    if (result.isError()) {
      const error = result.error
      if (error instanceof ApplicationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error('POST /api/tasks/:id/complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Step 6: Testing

### 6.1 Domain Tests

```typescript
// /src/server/domain/task/__tests__/task.entity.test.ts

import { describe, it, expect } from 'vitest'
import { Task } from '../task.entity'
import { BusinessRuleError } from '@/server/shared/errors/business.error'

describe('Task Entity', () => {
  const validTaskData = {
    title: 'Fix broken sink',
    description: 'Kitchen sink is leaking and needs repair',
    category: 'home_repair' as const,
    budget: { amount: 100, currency: 'BGN' },
    location: { city: 'Sofia' },
    urgency: 'within_week' as const
  }

  describe('create', () => {
    it('should create task with valid data', () => {
      const task = Task.create(validTaskData, 'user-123')

      expect(task.title).toBe('Fix broken sink')
      expect(task.status).toBe('open')
      expect(task.createdBy).toBe('user-123')
    })
  })

  describe('validate', () => {
    it('should pass validation with valid data', () => {
      const task = Task.create(validTaskData, 'user-123')
      const result = task.validate()

      expect(result.isOk()).toBe(true)
    })

    it('should fail validation with short title', () => {
      const task = Task.create({ ...validTaskData, title: 'Fix' }, 'user-123')
      const result = task.validate()

      expect(result.isError()).toBe(true)
      expect(result.error.fields?.title).toBeDefined()
    })
  })

  describe('accept', () => {
    it('should accept application when task is open', () => {
      const task = Task.create(validTaskData, 'user-123')
      const result = task.accept('professional-456')

      expect(result.isOk()).toBe(true)
      expect(task.status).toBe('in_progress')
      expect(task.assignedTo).toBe('professional-456')
    })

    it('should not accept application when task is not open', () => {
      const task = Task.create(validTaskData, 'user-123')
      task.accept('professional-456')

      const result = task.accept('professional-789')

      expect(result.isError()).toBe(true)
      expect(result.error).toBeInstanceOf(BusinessRuleError)
    })
  })

  describe('complete', () => {
    it('should mark as complete when in progress', () => {
      const task = Task.create(validTaskData, 'user-123')
      task.accept('professional-456')

      const result = task.complete()

      expect(result.isOk()).toBe(true)
      expect(task.status).toBe('pending_customer_confirmation')
    })

    it('should not complete when not in progress', () => {
      const task = Task.create(validTaskData, 'user-123')

      const result = task.complete()

      expect(result.isError()).toBe(true)
    })
  })
})
```

---

## Next Steps

1. **Copy base utilities** - Result type, error classes
2. **Implement Task domain** - Entity, types, rules
3. **Create Task repository** - Interface + Drizzle implementation
4. **Create Task service** - Business logic orchestration
5. **Create API routes** - Next.js endpoints
6. **Test the flow** - Create, update, complete tasks
7. **Repeat for other entities** - User, Application, Review

---

## Migration to NestJS (Future)

When ready to migrate, you'll:

1. Create NestJS project
2. **Copy entire `/server` directory** (domain, application, infrastructure)
3. Create NestJS controllers that use the same services
4. Replace DI container with NestJS dependency injection
5. Run both APIs in parallel during migration
6. Gradually switch traffic to NestJS

**The key**: 90% of your code (domain, application, infrastructure) works identically in both frameworks!

---

**Ready to start? Begin with Step 1 and work through each section.** 🚀
