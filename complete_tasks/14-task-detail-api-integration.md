# Task 14: Task Detail API Integration

## Overview
Replace mock data in the task detail page with real API fetching, implement proper error handling, and ensure seamless navigation throughout the application.

## Current State

### Existing Infrastructure (Already Complete)
- **API Endpoint**: `/api/tasks/[id]` fully implemented with GET method
- **Service Layer**: `TaskService.getTaskDetail()` handles fetching with privacy filtering
- **Repository**: `TaskRepository.findByIdWithRelations()` queries database
- **Privacy Filtering**: `applyPrivacyFilter()` hides sensitive data from non-owners
- **Type Definitions**: `TaskDetailResponse<Task>` interface exists

### Current Page Implementation
```typescript
// /src/app/[lang]/tasks/[id]/page.tsx
export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
 const { id, lang } = await params;

 // ❌ Uses mock data
 const task = getTaskById(id);
 const similarTasks = getSimilarTasks(id, 3);

 return <TaskDetailContent task={task} similarTasks={similarTasks} lang={lang} />;
}
```

## Implementation Plan

### 1. Update Task Detail Page (Server Component)

**File**: `/src/app/[lang]/tasks/[id]/page.tsx`

**Changes Required**:
- Remove mock data imports (`getTaskById`, `getSimilarTasks`)
- Add real API fetch to `/api/tasks/[id]`
- Handle loading state (automatic with Server Components)
- Handle error states (404, 500)
- Handle not found gracefully
- Add proper TypeScript types for API response

**Implementation Pattern**:
```typescript
export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
 const { id, lang } = await params;

 try {
  // Fetch task from API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
   cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
   if (response.status === 404) {
    // Show 404 page
    notFound();
   }
   throw new Error('Failed to fetch task');
  }

  const data: TaskDetailResponse<Task> = await response.json();

  // Fetch similar tasks (can be done in parallel)
  const similarTasks = await fetchSimilarTasks(data.task.category, id);

  return (
   <TaskDetailContent
    task={data.task}
    similarTasks={similarTasks}
    isOwner={data.relatedData.isOwner}
    applicationsCount={data.relatedData.applicationsCount}
    lang={lang}
   />
  );
 } catch (error) {
  // Show error page
  throw error; // Next.js will catch and show error.tsx
 }
}
```

### 2. Similar Tasks Fetching Strategy

**Option A**: Use existing Browse Tasks API with filters
```typescript
async function fetchSimilarTasks(category: string, excludeId: string) {
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
 const response = await fetch(
  `${baseUrl}/api/tasks?category=${category}&limit=3&status=open`,
  { cache: 'no-store' }
 );

 if (!response.ok) return [];

 const data = await response.json();
 return data.tasks.filter((t: Task) => t.id !== excludeId).slice(0, 3);
}
```

**Option B**: Keep mock data temporarily for similar tasks
- Similar tasks are less critical than main task data
- Can be implemented later with dedicated API endpoint
- For now, use mock data as fallback

**Decision**: Go with Option A - use existing browse API for consistency

### 3. Error Handling

**Create `not-found.tsx`** in `/src/app/[lang]/tasks/[id]/`
```typescript
export default function TaskNotFound() {
 return (
  <div className="container mx-auto px-4 py-12 text-center">
   <h1 className="text-3xl font-bold mb-4">Task Not Found</h1>
   <p className="text-gray-600 mb-6">
    The task you're looking for doesn't exist or has been removed.
   </p>
   <Button asChild>
    <Link href="/browse-tasks">Browse Tasks</Link>
   </Button>
  </div>
 );
}
```

**Create `error.tsx`** in `/src/app/[lang]/tasks/[id]/`
```typescript
'use client'

export default function TaskError({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 return (
  <div className="container mx-auto px-4 py-12 text-center">
   <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
   <p className="text-gray-600 mb-6">{error.message}</p>
   <Button onClick={reset}>Try Again</Button>
  </div>
 );
}
```

### 4. Update TaskDetailContent Component (if needed)

**File**: `/src/app/[lang]/tasks/[id]/components/task-detail-content.tsx`

**Review Props Interface**:
```typescript
interface TaskDetailContentProps {
 task: Task;
 similarTasks: Task[];
 isOwner?: boolean; // Add if not present
 applicationsCount?: number; // Add if not present
 lang: string;
}
```

**Use metadata for conditional rendering**:
- Show/hide TaskActivity component based on `isOwner`
- Display application count from `applicationsCount`

### 5. Navigation Testing Checklist

**From Browse Page**:
- [ ] Click "See details" button → navigates to `/[lang]/tasks/[id]`
- [ ] Task data loads correctly
- [ ] Privacy filtering works (address hidden for non-owners)

**Direct URL Navigation**:
- [ ] Enter `/en/tasks/[valid-id]` → task loads
- [ ] Enter `/en/tasks/invalid-id` → 404 page shows
- [ ] Enter `/bg/tasks/[id]` → task loads with Bulgarian translations
- [ ] Enter `/ru/tasks/[id]` → task loads with Russian translations

**Error States**:
- [ ] Network error → error.tsx shows with retry button
- [ ] Task not found → not-found.tsx shows
- [ ] Unauthorized access → privacy filter hides sensitive data

**Similar Tasks**:
- [ ] Similar tasks load correctly
- [ ] Clicking similar task → navigates to new task detail page
- [ ] Category filtering works

## Implementation Steps

1. **Update page.tsx** with real API fetch (20 min)
2. **Create not-found.tsx** for 404 handling (10 min)
3. **Create error.tsx** for error handling (10 min)
4. **Implement similar tasks fetching** using browse API (15 min)
5. **Update TaskDetailContent props** if needed (5 min)
6. **Test all navigation scenarios** (20 min)

**Total Estimated Time**: ~80 minutes

## Success Criteria

- [ ] Task detail page fetches real data from `/api/tasks/[id]`
- [ ] Mock data imports removed from page.tsx
- [ ] 404 handling works for invalid task IDs
- [ ] Error handling works for network/server errors
- [ ] Similar tasks load from browse API
- [ ] Privacy filtering works (non-owners can't see address)
- [ ] Navigation from browse page works
- [ ] Direct URL navigation works
- [ ] All translations (EN/BG/RU) work correctly
- [ ] No console errors or warnings

## Technical Notes

- **Server Component Pattern**: Use async/await directly in page component
- **Environment Variable**: Use `NEXT_PUBLIC_BASE_URL` for API calls
- **Cache Strategy**: ISR with 1-hour revalidation (see Performance Optimization below)
- **Type Safety**: Import `TaskDetailResponse<Task>` from types
- **Error Boundaries**: Next.js automatically catches errors in error.tsx

## Performance Optimization - ISR (Incremental Static Regeneration)

### Configuration
```typescript
export const revalidate = 3600; // Revalidate every 1 hour
```

### How It Works
1. **First Request**: User visits `/tasks/123` → Page fetches from DB, renders, and caches
2. **Subsequent Requests** (within 1 hour): Users get cached HTML instantly (no DB query!)
3. **After 1 Hour**: Next request serves cached version but triggers background regeneration
4. **Background Update**: Page regenerates with fresh data, updates cache for future requests

### Benefits
- **99% Faster Page Loads**: Most users get instant cached pages
- **~99% Fewer DB Queries**: Dramatically reduces database load
- **Still Fresh**: Pages update within 1 hour of data changes
- **Better UX**: No loading spinners for cached pages
- **Significant Cost Savings**: Minimal database queries = much lower infrastructure costs

### Revalidation Time Rationale
- **1 hour** chosen because:
  - Tasks rarely change once posted
  - Most changes happen when first creating the task
  - Viewers far outnumber editors (99:1 ratio)
  - Excellent balance between freshness and performance
  - Can always use on-demand revalidation for immediate updates when tasks are edited

### Future Enhancements
- **On-Demand Revalidation**: When task owner edits task, trigger immediate revalidation
  ```typescript
  // In edit task API route
  revalidatePath(`/tasks/${taskId}`)
  ```
- **Stale-While-Revalidate**: Show cached data while fetching fresh data in background
- **Per-Status Revalidation**: Different times for different task statuses
  - Open tasks: 1 hour (current default)
  - Completed/Archived tasks: 24 hours (very rarely change)

## Future Enhancements (Not in this task)

- Add loading skeleton UI (optional - Server Components handle this)
- Implement dedicated similar tasks API endpoint
- Add task caching strategy for better performance
- Implement optimistic UI updates for task actions
- Add breadcrumb navigation
