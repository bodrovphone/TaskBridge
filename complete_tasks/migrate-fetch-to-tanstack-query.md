# Migrate Home-Made Fetches to TanStack Query

## Task Description
Scan the entire project for components and pages that use manual `fetch` with `useState`/`useEffect` patterns and migrate them to use TanStack Query hooks. This will improve consistency, add automatic caching, background refetching, and reduce boilerplate code.

## Requirements

### Phase 1: Discovery & Audit
- [ ] Scan all client components for `useEffect` + `fetch` patterns
- [ ] Identify all API endpoints being called
- [ ] Document current data fetching patterns
- [ ] Create migration priority list

### Phase 2: Create Custom Hooks
Create TanStack Query hooks for each data domain:
- [ ] `use-applications.ts` - Professional applications (my applications, my work)
- [ ] `use-browse-tasks.ts` - Browse tasks page with filters
- [ ] `use-task-detail.ts` - Individual task details
- [ ] `use-user-profile.ts` - User profile data
- [ ] Additional hooks as needed

### Phase 3: Migrate Components
- [ ] Migrate `/tasks/applications` page (professional view)
- [ ] Migrate `/tasks/work` page (professional active work)
- [ ] Migrate browse tasks page
- [ ] Migrate profile page
- [ ] Migrate any other pages with manual fetch

## Search Patterns to Find

### Pattern 1: useEffect + fetch + useState
```typescript
const [data, setData] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  async function fetchData() {
    setIsLoading(true)
    const response = await fetch('/api/...')
    const data = await response.json()
    setData(data)
    setIsLoading(false)
  }
  fetchData()
}, [dependencies])
```

### Pattern 2: Manual refetch triggers
```typescript
const [refreshTrigger, setRefreshTrigger] = useState(0)
const refetch = () => setRefreshTrigger(prev => prev + 1)
```

### Pattern 3: Callback-based refetch
```typescript
interface Props {
  onRefresh?: () => void
}
// Child calls onRefresh() after mutation
```

## Search Commands

```bash
# Find components with fetch patterns
grep -r "useEffect" --include="*.tsx" src/app src/components src/features

# Find manual loading states
grep -r "setIsLoading" --include="*.tsx" src/

# Find fetch calls
grep -r "await fetch" --include="*.tsx" src/

# Find refresh triggers
grep -r "refreshTrigger\|refetchTrigger" --include="*.tsx" src/
```

## Acceptance Criteria

### For Each Migrated Component:
- [ ] Remove manual `useState` for data, loading, error
- [ ] Remove `useEffect` with fetch logic
- [ ] Create or use existing custom TanStack Query hook
- [ ] Move data transformation logic to hook
- [ ] Replace `onRefresh` callbacks with query invalidation
- [ ] Remove `router.refresh()` calls in favor of query invalidation
- [ ] Verify automatic refetch works on window focus
- [ ] Verify loading and error states work correctly
- [ ] Test mutations trigger automatic refetch

### Quality Standards:
- [ ] All query keys exported as constants (e.g., `POSTED_TASKS_QUERY_KEY`)
- [ ] Consistent stale time strategy across similar data types
- [ ] Proper TypeScript types for all queries and mutations
- [ ] Error handling with user-friendly messages
- [ ] Loading states provide good UX
- [ ] No duplicate queries for same data

## Technical Notes

### Hook Structure Template
```typescript
// /src/hooks/use-{feature}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'

export const FEATURE_QUERY_KEY = ['feature-name']

interface ApiResponse {
  // Type the API response
}

async function fetchFeatureData(): Promise<FeatureData[]> {
  const response = await fetch('/api/feature', {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch')
  }

  const data: ApiResponse = await response.json()
  return data.items.map(item => ({
    // Transform to app format
  }))
}

export function useFeature() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: FEATURE_QUERY_KEY,
    queryFn: fetchFeatureData,
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const mutation = useMutation({
    mutationFn: async (data: MutationInput) => {
      // API call
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEY })
    }
  })

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    mutate: mutation.mutateAsync,
    isMutating: mutation.isPending,
  }
}
```

### Stale Time Guidelines
- **Posted Tasks / My Work**: 2 minutes (frequently changing)
- **Browse Tasks**: 5 minutes (moderately changing)
- **Notifications**: 10 minutes (checked periodically)
- **User Profile**: 10 minutes (rarely changes)
- **Categories / Static Data**: 30 minutes or Infinity

### Migration Checklist per Component
1. ✅ Create/identify the custom hook
2. ✅ Move fetch logic to hook
3. ✅ Move data transformation to hook
4. ✅ Replace useState/useEffect with hook call
5. ✅ Replace onRefresh callbacks with invalidateQueries
6. ✅ Update child components to remove callbacks
7. ✅ Test loading states
8. ✅ Test error states
9. ✅ Test mutations trigger refetch
10. ✅ Test window focus refetch

## Examples

### ✅ Already Migrated (Reference):
- `/tasks/posted` page - Uses `usePostedTasks()`
- `/notifications` - Uses `useNotificationsQuery()`

### 🎯 High Priority (Common Pages):
1. `/tasks/applications` - Professional applications list
2. `/tasks/work` - Professional active work
3. `/browse-tasks` - Task browsing with filters

### 📋 Medium Priority:
4. User profile page
5. Task detail page (if uses fetch)
6. Professional detail page

### 🔄 Low Priority:
7. Any admin or settings pages
8. One-off components with simple fetches

## Priority
**High** - This is a codebase-wide consistency improvement that will reduce bugs, improve UX, and make future development easier.

## Estimated Effort
- Discovery: 1-2 hours
- Create hooks: 3-4 hours
- Migrate components: 4-6 hours
- Testing: 2-3 hours
- **Total**: 10-15 hours

## Dependencies
- TanStack Query already configured ✅
- `usePostedTasks()` hook as reference ✅
- `useNotificationsQuery()` hook as reference ✅

## Notes
- Start with high-traffic pages (browse, applications, work)
- Test thoroughly after each migration
- Can be done incrementally - no need to migrate everything at once
- Keep old implementations commented out temporarily in case rollback needed
- Update CLAUDE.md after completion to reflect best practices
