# Task 13: GET Tasks API & Browse Filters

## Task Description

Implement a flexible GET tasks API endpoint with comprehensive filtering, sorting, and pagination capabilities. Then build a modern filter UI for the Browse Tasks page.

## Architecture Decision

**Hybrid Approach**: Single flexible endpoint (`GET /api/tasks`) with intelligent query parameter filtering, combined with specialized service methods for different use cases.

**Key Principles:**
- Session-based authentication (auto-detect user from cookies)
- Privacy filtering by default (hide exact address from non-owners)
- Offset-based pagination (page/limit)
- Clean separation: Repository → Service → API layers
- Result pattern for consistent error handling

---

## API Endpoints

### 1. List Tasks (Flexible Query)
```
GET /api/tasks?mode=browse&category=plumbing&city=Sofia&sortBy=urgent&page=1
```

**Query Parameters:**
- `mode`: 'browse' | 'posted' | 'applications' (preset filter combinations)
- `status`: Task status filter (can be comma-separated: 'open,in_progress')
- `category`: Filter by category
- `city`: Filter by city
- `search`: Full-text search in title/description
- `isUrgent`: Filter urgent tasks (boolean)
- `budgetMin`, `budgetMax`: Budget range filter
- `sortBy`: 'newest' | 'urgent' | 'budget_high' | 'budget_low' | 'deadline'
- `page`, `limit`: Pagination

**Modes:**
- **browse**: Public open tasks only (no auth required)
- **posted**: Current user's posted tasks (requires auth, auto-uses session)
- **applications**: Tasks where user has applied (requires auth, auto-uses session)

### 2. Task Detail
```
GET /api/tasks/[id]
```

**Response includes:**
- Task data (with privacy filtering)
- Related metadata: `isOwner`, `applicationsCount`, `userHasApplied`
- Auto-detects viewer from session

---

## Requirements

### Phase 1: Core Query Infrastructure ⭐ HIGH PRIORITY
**Files to create:**
- `/src/server/tasks/task.query-types.ts` - Type definitions
- `/src/server/tasks/task.query-parser.ts` - Query parsing and validation
- `/src/server/tasks/task.privacy.ts` - Privacy filtering logic

**Files to update:**
- `/src/server/tasks/task.repository.ts` - Add `findMany()` method
- `/src/server/tasks/task.service.ts` - Add `getTasks()` method

**Key Types:**
```typescript
interface TaskQueryParams {
  // Filtering
  status?: string | string[]
  category?: string
  city?: string
  search?: string
  isUrgent?: boolean | string
  budgetMin?: string | number
  budgetMax?: string | number

  // Sorting
  sortBy?: TaskSortOption

  // Pagination
  page?: string | number
  limit?: string | number

  // Preset modes
  mode?: 'browse' | 'posted' | 'applications'
}

interface TaskQueryOptions {
  filters: {
    status?: TaskStatus[]
    category?: string
    city?: string
    search?: string
    isUrgent?: boolean
    budgetMin?: number
    budgetMax?: number
  }
  sort: { field: string; ascending: boolean }
  pagination: { page: number; limit: number; offset: number }
  viewerId?: string
}

interface PaginatedTasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
```

### Phase 2: Basic GET Endpoint ⭐ HIGH PRIORITY
**Files to update:**
- `/src/app/api/tasks/route.ts` - Implement GET handler

**Features:**
- Auto-detect user from session (no manual user ID passing)
- Support browse mode (public)
- Support posted mode (authenticated, auto-inject user ID)
- Authorization checks for protected modes
- Privacy filtering applied automatically

**Example Implementation:**
```typescript
export async function GET(request: NextRequest) {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Parse query params
  const params = parseSearchParams(request.url)

  // 3. Smart auto-injection for protected modes
  if (params.mode === 'posted') {
    if (!user) return unauthorized()
    params.customerId = user.id  // ✅ Auto-inject from session
  }

  if (params.mode === 'applications') {
    if (!user) return unauthorized()
    params.professionalId = user.id  // ✅ Auto-inject from session
  }

  // 4. Add viewerId for privacy filtering
  params.viewerId = user?.id

  // 5. Execute query
  const taskService = new TaskService()
  const result = await taskService.getTasks(params)

  // 6. Return response
  return NextResponse.json(result.data, { status: 200 })
}
```

### Phase 3: Single Task Detail ⭐ MEDIUM PRIORITY
**Files to create:**
- `/src/app/api/tasks/[id]/route.ts` - Task detail endpoint

**Files to update:**
- `/src/server/tasks/task.repository.ts` - Add `findByIdWithRelations()`
- `/src/server/tasks/task.service.ts` - Add `getTaskDetail()`

**Features:**
- Get task by ID with privacy filtering
- Include related data (applications count)
- Return metadata: `isOwner`, `userHasApplied`
- Auto-detect viewer from session

### Phase 4: Applications Join Query ⭐ MEDIUM PRIORITY
**Files to update:**
- `/src/server/tasks/task.repository.ts` - Add `findByProfessionalApplications()`

**Features:**
- Join tasks with applications table
- Filter by application status
- Support pagination

### Phase 5: Authorization & Security ⭐ HIGH PRIORITY
**Files to create:**
- `/src/server/tasks/task.authorization.ts` - Authorization checks

**Features:**
- `canViewPostedTasks()` - Verify user can only see their own tasks
- `canViewApplications()` - Verify user can only see their own applications
- Integrate authorization into API routes

### Phase 6: Advanced Features ⚪ LOW PRIORITY
**Future enhancements:**
- Full-text search optimization (Postgres FTS)
- Cursor-based pagination for infinite scroll
- Query result caching (Redis)
- Rate limiting per user

---

## Phase 7: Browse Tasks Filter UI ⭐ HIGH PRIORITY

### Filter Components

**1. Category Filter** (Reuse from Professionals)
- Home Repair
- Delivery & Transport
- Personal Care
- Personal Assistant
- Learning & Fitness
- Other

**2. Location Filter** (Reuse from Professionals)
- City dropdown (Bulgarian cities)
- Optional neighborhood secondary filter

**3. Budget Range Filter** (New)
- Dual range or min/max inputs
- Presets: Under 50 лв, 50-150 лв, 150-300 лв, 300-500 лв, 500+ лв, Custom

**4. Urgency Filter** (New)
- Urgent (same day) - `is_urgent=true`
- This week - `deadline` within 7 days
- Flexible - `deadline > 7 days` or no deadline
- All tasks

**5. Sort Dropdown** (New)
- Newest first (default)
- Urgent first
- Highest budget
- Lowest budget
- Ending soon (deadline)

**6. Search Bar** (Update)
- Text search in title + description
- Integrate with other filters

### Components to Create

**New Components:**
1. `/src/features/browse-tasks/components/budget-filter.tsx`
2. `/src/features/browse-tasks/components/urgency-filter.tsx`
3. `/src/features/browse-tasks/components/sort-dropdown.tsx`
4. `/src/features/browse-tasks/components/filter-bar.tsx` (container)
5. `/src/features/browse-tasks/components/filters-modal.tsx` (mobile)
6. `/src/features/browse-tasks/hooks/use-task-filters.ts`

**Adapt from Professionals:**
7. Category filter component
8. Location filter component

**Update:**
9. `/src/app/[lang]/browse-tasks/page.tsx` - Integrate filters
10. Update search bar component

### Filter State Management

```typescript
// /src/features/browse-tasks/hooks/use-task-filters.ts

interface TaskFilters {
  category?: string
  city?: string
  budget?: { min?: number; max?: number }
  urgency?: 'same_day' | 'within_week' | 'flexible'
  search?: string
  sortBy?: 'newest' | 'urgent' | 'budget_high' | 'budget_low' | 'deadline'
  page?: number
}

export const useTaskFilters = () => {
  // Sync with URL search params
  // Update filter
  // Reset filters
  // Build API query
  // Return filter state and actions
}
```

### Mobile Filter Modal

- Slide-up sheet with all filters
- "Show X tasks" button
- Reset filters button
- Active filter count badge

### Filter Persistence

- Store in URL search params
- Shareable links
- Browser back/forward support
- Page refresh persistence

---

## Acceptance Criteria

### API (Phases 1-5)
- [ ] GET /api/tasks works with all query parameters
- [ ] Browse mode returns public open tasks
- [ ] Posted mode auto-detects user from session (requires auth)
- [ ] Applications mode auto-detects user from session (requires auth)
- [ ] Privacy filtering hides exact address from non-owners
- [ ] Pagination metadata is correct (total, totalPages, hasNext, hasPrevious)
- [ ] Task detail endpoint returns task with metadata
- [ ] Authorization checks prevent unauthorized access
- [ ] All query parameters properly validated
- [ ] Error handling with proper status codes

### Filter UI (Phase 7)
- [ ] Category filter works (reused from professionals)
- [ ] Location/city filter works (reused from professionals)
- [ ] Budget range filter works (new component)
- [ ] Urgency filter works (new component)
- [ ] Sort dropdown works (new component)
- [ ] Search bar integrated with filters
- [ ] Filters sync with URL search params
- [ ] Mobile filter modal works (slide-up sheet)
- [ ] Active filter count badge displays
- [ ] Reset filters button works
- [ ] Filter state persists on page refresh
- [ ] Shareable filter URLs work
- [ ] Desktop and mobile layouts responsive

---

## Technical Notes

### Privacy Filtering
```typescript
// Auto-applied based on session
const isOwner = task.customer_id === viewerId

const filteredTask = {
  ...task,
  address: isOwner ? task.address : null,  // Hide from non-owners
  location_notes: isOwner ? task.location_notes : null
}
```

### Session-Based Auth (No Manual User IDs)
```typescript
// ✅ GOOD: Auto-detect from session
GET /api/tasks?mode=posted

// ❌ BAD: Frontend passing user ID
GET /api/tasks?mode=posted&customerId=user-123
```

### Query Examples
```bash
# Browse open tasks in Sofia
GET /api/tasks?mode=browse&city=Sofia&category=plumbing&page=1

# My posted tasks (auth required, auto-detects user)
GET /api/tasks?mode=posted&status=open&page=1

# My applications (auth required, auto-detects user)
GET /api/tasks?mode=applications&page=1

# Task detail (auto-applies privacy)
GET /api/tasks/uuid
```

### Filter URL Example
```
/en/browse-tasks?category=plumbing&city=Sofia&budgetMin=50&budgetMax=200&urgency=same_day&sortBy=urgent&page=1
```

---

## Implementation Order

**Tomorrow's Focus:**
1. **Phase 1**: Core query infrastructure (types, parser, privacy, repository)
2. **Phase 2**: Basic GET endpoint (browse + posted modes)
3. **Phase 3**: Task detail endpoint
4. Test API thoroughly

**After API is complete:**
5. **Phase 7**: Build filter UI components
6. Integrate filters with browse page
7. Test full user flow

**Later:**
8. Phase 4: Applications query
9. Phase 5: Enhanced authorization
10. Phase 6: Advanced features (caching, search optimization)

---

## Priority

**HIGH** - Core API is blocking multiple features (browse tasks, posted tasks pages)

---

## Related Files

- `/src/server/tasks/task.repository.ts` - Database layer
- `/src/server/tasks/task.service.ts` - Business logic
- `/src/server/tasks/task.validation.ts` - Existing validation
- `/src/app/api/tasks/route.ts` - Existing POST endpoint
- `/src/features/professionals/components/*` - Filter components to reuse
- `/src/app/[lang]/browse-tasks/*` - Browse page to update
- `/src/app/[lang]/tasks/posted/*` - Posted tasks page (needs API)
- `/src/app/[lang]/tasks/applications/*` - Applications page (needs API)

---

## Success Metrics

- [ ] Can browse open tasks with filters
- [ ] Can view my posted tasks
- [ ] Can view my applications
- [ ] Task privacy respected (address hidden from non-owners)
- [ ] Filters sync with URL (shareable links)
- [ ] Mobile filter UI works smoothly
- [ ] Type checking passes
- [ ] No console errors
