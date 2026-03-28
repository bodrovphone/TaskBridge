# Global API Type Registry

**Location**: `/src/types/api.d.ts`

The codebase uses a global `API` interface for type-safe access to all DTOs and entity types. No imports needed - types are available globally throughout the application.

## Why Global Types?

- **No import boilerplate**: Use `API['TypeName']` anywhere without imports
- **Single source of truth**: All types defined in one place
- **IDE autocomplete**: Full IntelliSense support for all types
- **Refactoring friendly**: Change type once, updates everywhere

## Usage

```typescript
// Access any type via API['TypeName'] - no imports required
interface Props {
  professional: API['ProfessionalData']
  tasks: API['TaskSelection'][]
}

const user: API['UserProfile'] = { ... }
const task: API['TaskCreate'] = { title: 'Fix sink', ... }

// In function signatures
function createTask(data: API['TaskCreate']): Promise<API['Task']> {
  // ...
}
```

## Available Type Domains

### User Domain

| Type | Description |
|------|-------------|
| `UserProfile` | Full user profile entity |
| `UserCreate` | DTO for creating a new user |
| `UserUpdate` | DTO for updating user profile |
| `PreferredLanguage` | User's preferred language |
| `PreferredContact` | User's preferred contact method |
| `AvailabilityStatus` | Professional availability status |
| `RegistrationIntent` | User registration intent (customer or professional) |
| `GalleryItem` | Portfolio gallery item |
| `ServiceItem` | Service offering with pricing |
| `WorkingHours` | Working hours configuration |
| `NotificationPreferences` | Notification preferences |
| `PrivacySettings` | Privacy settings |

### Task Domain

| Type | Description |
|------|-------------|
| `Task` | Task entity |
| `TaskCreate` | DTO for creating a new task |
| `TaskUpdate` | DTO for updating a task |
| `TaskStatus` | Task lifecycle status |
| `TaskDbInsert` | Task database insert payload |
| `TaskCreateResult` | Task creation API response |
| `TaskQueryParams` | Task query parameters (raw from URL) |
| `TaskQueryOptions` | Task query options (parsed/validated) |
| `TaskSortOption` | Task sort option |
| `TaskQueryMode` | Task query preset mode |
| `TasksResponse` | Paginated tasks response |
| `TaskDetailResponse` | Single task detail response |

### Professional Domain

| Type | Description |
|------|-------------|
| `Professional` | Professional entity (public-safe fields) |
| `ProfessionalRaw` | Professional raw database data |
| `ProfessionalDetail` | Professional with extended detail |
| `ProfessionalsResponse` | Paginated professionals response |
| `CompletedTaskItem` | Completed task item for professional profile |
| `ReviewItem` | Review item for professional profile |
| `FeaturedCriteria` | Featured status criteria |
| `ProfessionalQueryParams` | Professional query parameters |
| `ProfessionalSortOption` | Professional sort option |

### Application Domain

| Type | Description |
|------|-------------|
| `Application` | Application entity |
| `ApplicationStatus` | Application lifecycle status |
| `ApplicationProfessional` | Professional data within an application |
| `ApplicationFilters` | Application filter options |
| `ApplicationStats` | Application statistics |
| `ProfessionalReview` | Professional review in application context |
| `ApplicationSortOption` | Application sort option |

### Notification Domain

| Type | Description |
|------|-------------|
| `Notification` | Notification entity |
| `NotificationType` | Notification type enum |
| `NotificationFilter` | Notification filter option |

### Review Domain

| Type | Description |
|------|-------------|
| `Review` | Review entity |
| `ReviewSubmit` | DTO for submitting a review |
| `PendingReviewTask` | Pending review task |
| `BlockType` | Review block type |
| `CanCreateTaskResponse` | Can create task API response |

### Question Domain

| Type | Description |
|------|-------------|
| `Question` | Question entity |
| `Answer` | Answer entity |
| `QuestionUser` | Question asker/answerer |
| `QuestionWithAnswer` | Question with answer included |
| `QuestionFormData` | Question form input |
| `AnswerFormData` | Answer form input |
| `QuestionStats` | Question statistics |

### UI Component Types

| Type | Description |
|------|-------------|
| `ProfessionalData` | Professional data input (accepts both snake_case and camelCase) |
| `ProfessionalDisplay` | Professional data transformed for UI display |
| `ReviewDisplay` | Review item for ReviewsSection component |
| `CompletedTaskDisplay` | Completed task item for CompletedTasksSection component |
| `TaskSelection` | Task item for TaskSelectionModal component |
| `Service` | Service item for professional profile |

## Helper Types

```typescript
// Get a specific API type (alternative syntax)
type User = APIType<'UserProfile'>

// Get all available keys
type Keys = APIKeys  // 'UserProfile' | 'UserCreate' | 'Task' | ...
```

## Adding New Types

### 1. Define the type in its domain file

```typescript
// /src/server/tasks/task.types.ts
export interface NewTaskType {
  id: string
  // ...
}
```

### 2. Import it in the global declaration

```typescript
// /src/types/api.d.ts
import type { NewTaskType } from '@/server/tasks/task.types'
```

### 3. Add entry to the API interface

```typescript
// /src/types/api.d.ts
declare global {
  interface API {
    // ... existing types

    /** Description of new type */
    NewTask: NewTaskType
  }
}
```

## File Structure

```
/src/types/
├── api.d.ts              # Global API type registry (declare global)
├── professionals-ui.ts    # Professional UI component types
├── applications.ts        # Application types
├── notifications.ts       # Notification types
├── questions.ts          # Question types
└── index.ts              # Barrel exports (for non-global types)
```

## Best Practices

### DO
- Use `API['TypeName']` for all DTO and entity types
- Add JSDoc comments when adding new types
- Keep types organized by domain

### DON'T
- Don't import `API` - it's global
- Don't create local type aliases (use the global types directly)
- Don't duplicate type definitions
