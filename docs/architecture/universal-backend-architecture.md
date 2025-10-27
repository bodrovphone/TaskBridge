# Universal Backend Architecture Plan

## Overview

This document outlines a framework-agnostic backend architecture for TaskBridge that:
- Works seamlessly with current Next.js API routes
- Can be migrated to NestJS or any other framework without rewriting business logic
- Maintains clean separation between UI and backend code
- Follows Clean Architecture / Hexagonal Architecture principles

## Architecture Principles

### 1. **Dependency Rule**
- Inner layers (domain) know nothing about outer layers (API, UI)
- Outer layers depend on inner layers, never the reverse
- Business logic is completely independent of frameworks

### 2. **Framework Agnostic Core**
- All business logic works without Next.js, NestJS, or any framework
- Easy to test in isolation
- Can be deployed as standalone service

### 3. **Clear Boundaries**
- UI code stays in `/src/app`, `/src/features`, `/src/components`
- Backend code lives in `/src/server`
- Shared types in `/src/types`

---

## Proposed Directory Structure

```
/src/
├── app/                          # Next.js App Router (UI + API routes)
│   ├── [lang]/                   # UI pages (existing)
│   └── api/                      # API routes (thin wrappers)
│       ├── users/
│       │   └── route.ts          # Next.js route → calls UserService
│       ├── tasks/
│       │   └── route.ts          # Next.js route → calls TaskService
│       └── applications/
│           └── route.ts          # Next.js route → calls ApplicationService
│
├── server/                       # ⭐ Universal Backend Code
│   ├── domain/                   # Business entities and rules
│   │   ├── user/
│   │   │   ├── user.entity.ts    # User entity with business logic
│   │   │   ├── user.types.ts     # Domain types
│   │   │   └── user.rules.ts     # Business rules (validation, constraints)
│   │   ├── task/
│   │   │   ├── task.entity.ts
│   │   │   ├── task.types.ts
│   │   │   ├── task.rules.ts
│   │   │   └── task-status.machine.ts  # State machine for task statuses
│   │   ├── application/
│   │   │   ├── application.entity.ts
│   │   │   └── application.rules.ts
│   │   └── review/
│   │       ├── review.entity.ts
│   │       └── review.rules.ts
│   │
│   ├── application/              # Use cases / Application services
│   │   ├── users/
│   │   │   ├── user.service.ts           # User management use cases
│   │   │   ├── create-user.usecase.ts    # Specific use case
│   │   │   ├── verify-vat.usecase.ts
│   │   │   └── update-profile.usecase.ts
│   │   ├── tasks/
│   │   │   ├── task.service.ts
│   │   │   ├── create-task.usecase.ts
│   │   │   ├── accept-application.usecase.ts
│   │   │   ├── complete-task.usecase.ts
│   │   │   └── cancel-task.usecase.ts
│   │   ├── applications/
│   │   │   ├── application.service.ts
│   │   │   ├── submit-application.usecase.ts
│   │   │   └── withdraw-application.usecase.ts
│   │   ├── reviews/
│   │   │   ├── review.service.ts
│   │   │   └── create-review.usecase.ts
│   │   └── notifications/
│   │       ├── notification.service.ts
│   │       └── send-notification.usecase.ts
│   │
│   ├── infrastructure/           # External services & data access
│   │   ├── database/
│   │   │   ├── repositories/     # Repository implementations
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── task.repository.ts
│   │   │   │   ├── application.repository.ts
│   │   │   │   └── review.repository.ts
│   │   │   ├── mappers/          # Domain ↔ Database mapping
│   │   │   │   ├── user.mapper.ts
│   │   │   │   ├── task.mapper.ts
│   │   │   │   └── application.mapper.ts
│   │   │   └── drizzle/          # Drizzle-specific code
│   │   │       ├── client.ts
│   │   │       └── migrations/
│   │   ├── external/             # External API integrations
│   │   │   ├── vat-verification/
│   │   │   │   └── bulgarian-vat.service.ts
│   │   │   ├── sms/
│   │   │   │   └── sms-gateway.service.ts
│   │   │   └── email/
│   │   │       └── email.service.ts
│   │   └── storage/              # File storage
│   │       └── image-storage.service.ts
│   │
│   ├── api/                      # API layer abstractions
│   │   ├── middleware/           # Framework-agnostic middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error-handler.middleware.ts
│   │   ├── validators/           # Request validation schemas
│   │   │   ├── user.validators.ts
│   │   │   ├── task.validators.ts
│   │   │   └── application.validators.ts
│   │   └── dto/                  # Data Transfer Objects
│   │       ├── user.dto.ts
│   │       ├── task.dto.ts
│   │       └── application.dto.ts
│   │
│   └── shared/                   # Shared backend utilities
│       ├── errors/               # Custom error classes
│       │   ├── base.error.ts
│       │   ├── validation.error.ts
│       │   ├── not-found.error.ts
│       │   └── unauthorized.error.ts
│       ├── utils/                # Backend utilities
│       │   ├── date.utils.ts
│       │   ├── hash.utils.ts
│       │   └── pagination.utils.ts
│       └── types/                # Shared backend types
│           ├── result.type.ts    # Result<T, E> pattern
│           └── pagination.type.ts
│
├── features/                     # UI features (existing)
├── components/                   # UI components (existing)
├── database/                     # Database schema (existing)
│   └── schema.ts                 # Drizzle schema definitions
├── lib/                          # Global UI utilities (existing)
├── hooks/                        # React hooks (existing)
└── types/                        # Shared types (UI + API)
    ├── api/                      # API contract types
    │   ├── user.types.ts
    │   ├── task.types.ts
    │   └── application.types.ts
    └── shared/                   # Truly shared types
        └── common.types.ts
```

---

## Layer Responsibilities

### 1. Domain Layer (`/server/domain`)

**Purpose**: Pure business logic, entities, and rules

**Characteristics**:
- No framework dependencies
- No database dependencies
- Pure TypeScript classes and functions
- Testable in isolation

**Example - Task Entity**:
```typescript
// /server/domain/task/task.entity.ts
export class Task {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public createdBy: string,
    public budget: Money,
    public deadline?: Date
  ) {}

  // Business logic methods
  canBeAccepted(): boolean {
    return this.status === 'open'
  }

  accept(professionalId: string): void {
    if (!this.canBeAccepted()) {
      throw new InvalidTaskStateError('Task must be open to accept application')
    }
    this.status = 'in_progress'
    this.assignedTo = professionalId
  }

  complete(): void {
    if (this.status !== 'in_progress') {
      throw new InvalidTaskStateError('Task must be in progress to complete')
    }
    this.status = 'pending_customer_confirmation'
  }

  // More business methods...
}
```

**Example - Business Rules**:
```typescript
// /server/domain/task/task.rules.ts
export class TaskCreationRules {
  static canCustomerCreateTask(customer: User, tasks: Task[]): Result<void, Error> {
    // Priority 1: HARD BLOCK - Pending confirmations
    const pendingConfirmations = tasks.filter(
      t => t.status === 'pending_customer_confirmation'
    )
    if (pendingConfirmations.length > 0) {
      return Result.error(
        new TaskCreationBlockedError('Must confirm pending tasks first')
      )
    }

    // Priority 2: SOFT BLOCK - Missing reviews
    const completedWithoutReview = tasks.filter(
      t => t.status === 'completed' && !t.reviewedByCustomer
    )
    if (completedWithoutReview.length >= 3) {
      return Result.error(
        new TaskCreationBlockedError('Must submit reviews for completed tasks')
      )
    }

    return Result.ok()
  }
}
```

---

### 2. Application Layer (`/server/application`)

**Purpose**: Use cases that orchestrate domain objects

**Characteristics**:
- Coordinates between domain and infrastructure
- Transaction boundaries
- No framework dependencies (uses interfaces)

**Example - Task Service**:
```typescript
// /server/application/tasks/task.service.ts
export class TaskService {
  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository,
    private notificationService: INotificationService
  ) {}

  async createTask(dto: CreateTaskDto, userId: string): Promise<Result<Task, Error>> {
    // 1. Get user and their tasks
    const user = await this.userRepository.findById(userId)
    if (!user) return Result.error(new NotFoundError('User not found'))

    const userTasks = await this.taskRepository.findByUserId(userId)

    // 2. Check business rules
    const canCreate = TaskCreationRules.canCustomerCreateTask(user, userTasks)
    if (canCreate.isError()) return canCreate

    // 3. Create domain entity
    const task = Task.create(dto, userId)

    // 4. Validate
    const validation = task.validate()
    if (validation.isError()) return validation

    // 5. Persist
    const saved = await this.taskRepository.save(task)

    // 6. Side effects (notifications, etc.)
    await this.notificationService.notifyNewTask(task)

    return Result.ok(saved)
  }

  async acceptApplication(
    taskId: string,
    applicationId: string,
    customerId: string
  ): Promise<Result<Task, Error>> {
    // Use case implementation...
  }
}
```

**Example - Use Case**:
```typescript
// /server/application/tasks/complete-task.usecase.ts
export class CompleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private applicationRepository: IApplicationRepository,
    private notificationService: INotificationService
  ) {}

  async execute(request: CompleteTaskRequest): Promise<Result<Task, Error>> {
    // 1. Load task
    const task = await this.taskRepository.findById(request.taskId)
    if (!task) return Result.error(new NotFoundError('Task not found'))

    // 2. Check authorization
    if (task.assignedTo !== request.professionalId) {
      return Result.error(new UnauthorizedError('Not assigned to this task'))
    }

    // 3. Execute business logic
    task.complete() // This validates state transition

    // 4. Persist
    await this.taskRepository.save(task)

    // 5. Notify customer
    await this.notificationService.notifyCustomer(task.createdBy, {
      type: 'task_completed',
      taskId: task.id
    })

    return Result.ok(task)
  }
}
```

---

### 3. Infrastructure Layer (`/server/infrastructure`)

**Purpose**: Implementations of external dependencies

**Characteristics**:
- Database access
- External APIs
- File storage
- Implements interfaces defined in application layer

**Example - Repository**:
```typescript
// /server/infrastructure/database/repositories/task.repository.ts
export class DrizzleTaskRepository implements ITaskRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<Task | null> {
    const row = await this.db.query.tasks.findFirst({
      where: eq(schema.tasks.id, id)
    })
    if (!row) return null
    return TaskMapper.toDomain(row)
  }

  async save(task: Task): Promise<Task> {
    const dbModel = TaskMapper.toPersistence(task)
    await this.db.insert(schema.tasks).values(dbModel)
    return task
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const rows = await this.db.query.tasks.findMany({
      where: eq(schema.tasks.createdBy, userId)
    })
    return rows.map(TaskMapper.toDomain)
  }
}
```

**Example - Mapper**:
```typescript
// /server/infrastructure/database/mappers/task.mapper.ts
export class TaskMapper {
  static toDomain(raw: DatabaseTask): Task {
    return new Task(
      raw.id,
      raw.title,
      raw.description,
      raw.status,
      raw.created_by,
      Money.fromCents(raw.budget_cents, raw.currency),
      raw.deadline ? new Date(raw.deadline) : undefined
    )
  }

  static toPersistence(task: Task): DatabaseTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      created_by: task.createdBy,
      budget_cents: task.budget.toCents(),
      currency: task.budget.currency,
      deadline: task.deadline?.toISOString()
    }
  }
}
```

---

### 4. API Layer (`/server/api` + `/app/api`)

**Purpose**: Framework-specific API implementation

**Phase 1 - Next.js API Routes**:
```typescript
// /app/api/tasks/route.ts (Next.js specific)
import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/server/application/tasks/task.service'
import { createTaskValidator } from '@/server/api/validators/task.validators'
import { container } from '@/server/container' // DI container

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request
    const body = await req.json()
    const validation = createTaskValidator.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // 2. Get user ID from auth (future)
    const userId = req.headers.get('x-user-id') // Placeholder

    // 3. Call service
    const taskService = container.resolve<TaskService>('TaskService')
    const result = await taskService.createTask(validation.data, userId)

    // 4. Handle result
    if (result.isError()) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      )
    }

    return NextResponse.json(result.value, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Phase 2 - NestJS Migration**:
```typescript
// /nestjs-backend/src/tasks/tasks.controller.ts (Future NestJS)
@Controller('tasks')
export class TasksController {
  constructor(private taskService: TaskService) {} // Same service!

  @Post()
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User
  ) {
    const result = await this.taskService.createTask(dto, user.id)

    if (result.isError()) {
      throw new BadRequestException(result.error.message)
    }

    return result.value
  }
}
```

**Key Point**: The `TaskService` and all business logic is **exactly the same** in both implementations!

---

## Dependency Injection Container

Create a simple DI container for managing service dependencies:

```typescript
// /server/container.ts
class Container {
  private services = new Map<string, any>()

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory)
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name)
    if (!factory) throw new Error(`Service ${name} not registered`)
    return factory()
  }
}

export const container = new Container()

// Registration
import { db } from '@/database/drizzle'

// Repositories
container.register('TaskRepository', () => new DrizzleTaskRepository(db))
container.register('UserRepository', () => new DrizzleUserRepository(db))

// Services
container.register('TaskService', () => new TaskService(
  container.resolve('TaskRepository'),
  container.resolve('UserRepository'),
  container.resolve('NotificationService')
))
```

---

## Migration Strategy: Next.js → NestJS

### Phase 1: Current State (Next.js API Routes)
```
Frontend (Next.js) → Next.js API Routes → Services → Repositories → Database
```

### Phase 2: Extract Business Logic
```
Frontend (Next.js) → Next.js API Routes (thin) → Services (framework-agnostic) → Database
```

### Phase 3: Run in Parallel
```
Frontend (Next.js) → Next.js API Routes → Services
                                            ↓
                     NestJS Backend      → Services (same code!)
```

### Phase 4: Full Migration
```
Frontend (Next.js) → NestJS Backend → Services → Database
```

**Migration Steps**:

1. **Extract business logic** into `/server` structure
2. **Create interface abstractions** for all dependencies
3. **Make Next.js routes thin wrappers** around services
4. **Set up NestJS project** in parallel
5. **Import `/server` code** into NestJS (copy or monorepo)
6. **Create NestJS controllers** that call same services
7. **Run both backends** with feature flags
8. **Gradually migrate routes** from Next.js to NestJS
9. **Deprecate Next.js API routes** once migration complete

---

## Interface Definitions

Define interfaces that both implementations use:

```typescript
// /server/application/users/ports/user-repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<User>
  update(user: User): Promise<User>
  delete(id: string): Promise<void>
}

// /server/application/notifications/ports/notification-service.interface.ts
export interface INotificationService {
  notifyNewTask(task: Task): Promise<void>
  notifyApplication(application: Application): Promise<void>
  notifyCustomer(userId: string, notification: Notification): Promise<void>
}
```

---

## Testing Strategy

### Unit Tests (Domain)
```typescript
// /server/domain/task/__tests__/task.entity.test.ts
describe('Task Entity', () => {
  it('should not allow accepting non-open task', () => {
    const task = new Task('id', 'title', 'desc', 'completed', 'user1', money)

    expect(() => task.accept('prof1')).toThrow(InvalidTaskStateError)
  })
})
```

### Integration Tests (Application)
```typescript
// /server/application/tasks/__tests__/task.service.test.ts
describe('TaskService', () => {
  it('should create task with valid data', async () => {
    const mockRepo = new InMemoryTaskRepository()
    const service = new TaskService(mockRepo, ...)

    const result = await service.createTask(validDto, 'user1')

    expect(result.isOk()).toBe(true)
    expect(result.value.title).toBe(validDto.title)
  })
})
```

### API Tests
```typescript
// /app/api/tasks/__tests__/route.test.ts
describe('POST /api/tasks', () => {
  it('should create task and return 201', async () => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(validTaskDto)
    })

    expect(response.status).toBe(201)
  })
})
```

---

## Benefits Summary

### ✅ Current (Next.js Phase)
- All business logic reusable
- Easy to test
- Clean separation of concerns
- No UI interference

### ✅ Migration (NestJS Phase)
- Reuse 90% of codebase
- Only rewrite API layer (controllers)
- Services, repositories, domain logic unchanged
- Run both backends in parallel during migration

### ✅ Long-term
- Framework-agnostic core
- Can switch frameworks anytime
- Easy to scale (microservices)
- Maintainable and testable

---

## Next Steps

1. **Create base folder structure** - `/server/domain`, `/server/application`, etc.
2. **Implement Result type** - For error handling
3. **Create first domain entity** - Task or User
4. **Implement first repository** - TaskRepository with Drizzle
5. **Create first service** - TaskService with one use case
6. **Create first Next.js route** - `/api/tasks` using the service
7. **Add tests** - Domain, application, and API tests
8. **Repeat for other entities** - User, Application, Review

---

**Document Version:** 1.0
**Date:** October 24, 2024
**Next Review:** After first entity implementation
