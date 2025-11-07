# Professional Detail Page - Completed Tasks Integration

## Task Description
Wire up the Completed Tasks section on the professional detail page to fetch and display real completed tasks from the `tasks` table in Supabase. The UI components already exist with task cards, ratings, and testimonials - we just need to integrate with the database.

## Current State
- ✅ UI components exist: `<CompletedTasksSection />` with task cards and client testimonials
- ✅ Conditional rendering: Only shows when `completedTasksList.length > 0`
- ❌ API returns empty array: `completedTasksList: []`
- ✅ Database table exists: `tasks` table in Supabase

## Target State
- Completed tasks fetched from database for each professional
- Display task details, completion dates, client ratings, testimonials
- All existing UI features work with real data (complexity badges, verification, etc.)

## Requirements

### 1. Database Schema Review
Review the `tasks` table schema from `/src/types/database.types.ts`:
- [ ] Check columns: `selected_professional_id`, `status`, `completed_at`
- [ ] Review relationship to `users` (customer), `applications`, and `reviews` tables
- [ ] Understand task completion workflow (when is status set to 'completed')

### 2. Define "Completed Task" Criteria
A task is completed when:
- [ ] `status = 'completed'`
- [ ] `selected_professional_id = professional.id`
- [ ] `completed_at IS NOT NULL`
- [ ] Task was actually worked on (not just applied to)

### 3. API Implementation
Update `/src/app/api/professionals/[id]/route.ts`:

- [ ] Fetch completed tasks where `selected_professional_id = professional.id`
- [ ] Use service role to bypass RLS (completed tasks are publicly viewable on profile)
- [ ] Fetch in parallel with main professional query for performance
- [ ] Filter by `status = 'completed'`
- [ ] Join with customer data for client name/avatar
- [ ] Join with reviews to get rating/testimonial
- [ ] Order by `completed_at DESC` (most recent first)
- [ ] Limit to 20 most recent tasks (or configurable)

```typescript
// Parallel fetch example
const [professionalResult, completedTasksResult] = await Promise.all([
  supabaseAdmin.from('users').select('*').eq('id', id).single(),
  supabaseAdmin
    .from('tasks')
    .select(`
      id,
      title,
      category,
      subcategory,
      budget_max_bgn,
      city,
      neighborhood,
      completed_at,
      estimated_duration_hours,
      customer:customer_id(full_name, avatar_url),
      review:reviews!reviewee_id(rating, comment, is_hidden)
    `)
    .eq('selected_professional_id', id)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(20)
]);
```

### 4. Data Transformation
Transform database tasks to match UI component expectations:

```typescript
interface CompletedTaskForUI {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  completedDate: string; // "2024-01-15" or formatted
  clientRating: number; // 1-5 stars
  budget: string; // "120 лв"
  location: string; // "София, Лозенец"
  clientName: string;
  clientAvatar?: string;
  testimonial?: string; // Optional client comment
  isVerified: boolean; // True if customer is verified
  durationCompleted: string; // "Завършено за 4ч"
  complexity: 'Simple' | 'Standard' | 'Complex';
}

// Transformation
const completedTasks = completedTasksResult.data?.map(task => {
  const review = task.review?.[0]; // Get first review (should be only one)

  return {
    id: task.id,
    title: task.title,
    category: getCategoryName(task.category, task.subcategory),
    completedDate: task.completed_at,
    clientRating: review?.rating || 0,
    budget: task.budget_max_bgn ? `${task.budget_max_bgn} лв` : 'Договорена',
    location: `${getCityLabel(task.city)}${task.neighborhood ? `, ${task.neighborhood}` : ''}`,
    clientName: task.customer?.full_name || 'Анонимен клиент',
    clientAvatar: task.customer?.avatar_url,
    testimonial: review?.comment && !review?.is_hidden ? review.comment : undefined,
    isVerified: task.customer?.is_phone_verified || task.customer?.is_email_verified || false,
    durationCompleted: task.estimated_duration_hours
      ? `Завършено за ${task.estimated_duration_hours}ч`
      : 'Завършено',
    complexity: determineComplexity(task), // Calculate based on budget, duration, category
  };
}) || [];
```

### 5. Complexity Calculation
Determine task complexity based on:
- [ ] Budget range (high budget = complex)
- [ ] Duration (longer = complex)
- [ ] Category (some categories inherently more complex)

```typescript
function determineComplexity(task: Task): 'Simple' | 'Standard' | 'Complex' {
  const budget = task.budget_max_bgn || 0;
  const duration = task.estimated_duration_hours || 0;

  // Complex: High budget OR long duration
  if (budget > 150 || duration > 6) return 'Complex';

  // Simple: Low budget AND short duration
  if (budget < 60 && duration < 2) return 'Simple';

  // Everything else is standard
  return 'Standard';
}
```

### 6. Privacy Considerations
- [ ] Only show completed tasks (not in-progress or cancelled)
- [ ] Respect customer privacy settings (some may not want tasks shown)
- [ ] Consider adding `is_public` flag to tasks table for privacy control
- [ ] Hide testimonials if review is marked `is_hidden`
- [ ] Show "Анонимен клиент" if customer opted for privacy

### 7. Empty State Handling
- [ ] When `completedTasks.length === 0`, section should not render (existing behavior)
- [ ] Consider showing message on professional's own profile: "Complete your first task to showcase your work"

### 8. Statistics Update
Professional stats should reflect completed tasks:
- [ ] Ensure `tasks_completed` count in `users` table is accurate
- [ ] Update count when task status changes to 'completed'
- [ ] Consider trigger/function to auto-update on task completion

### 9. Testing Checklist
- [ ] Professional with 0 completed tasks - section doesn't render
- [ ] Professional with 1-5 completed tasks - displays in grid correctly
- [ ] Professional with 20+ completed tasks - pagination/load more works
- [ ] Client names and avatars display correctly
- [ ] Ratings (1-5 stars) display correctly
- [ ] Testimonials show for reviewed tasks
- [ ] Anonymous clients show as "Анонимен клиент"
- [ ] Verification badges display correctly
- [ ] Complexity badges (Simple/Standard/Complex) display correctly
- [ ] Dates format correctly with i18n
- [ ] Location displays with translated city names
- [ ] Budget displays in correct format

## Technical Notes

### Database Query Performance
- Add index on `(selected_professional_id, status, completed_at)` for fast queries
- Use `.select()` with specific fields and joins to minimize data transfer
- Limit to 20 most recent tasks to avoid large payloads
- Consider pagination for professionals with 100+ completed tasks

### Review Join Strategy
Two approaches for getting ratings/testimonials:

**Option A: Join in query** (Recommended)
```typescript
.select(`
  *,
  review:reviews!reviewee_id(rating, comment, is_hidden)
`)
```

**Option B: Separate query**
```typescript
const reviewsResult = await supabase
  .from('reviews')
  .select('*')
  .eq('reviewee_id', professionalId)
  .eq('review_type', 'customer_to_professional')
  .in('task_id', taskIds);
```

Use Option A for simplicity unless performance issues arise.

### Task Status Workflow
Understand when tasks reach 'completed' status:
1. Professional applies to task
2. Customer accepts application → `selected_professional_id` set
3. Professional marks as complete → status = 'completed_by_professional'
4. Customer confirms completion → status = 'completed', `completed_at` set
5. Both can leave reviews

### Date Formatting
Use existing i18n date formatting:
```typescript
import { format } from 'date-fns';
import { bg, enUS, ru } from 'date-fns/locale';

const formattedDate = format(new Date(task.completed_at), 'yyyy-MM-dd', {
  locale: getDateLocale(i18n.language),
});

// Or relative: "преди 2 месеца"
const relativeDate = formatDistanceToNow(new Date(task.completed_at), {
  addSuffix: true,
  locale: getDateLocale(i18n.language),
});
```

### Fallback Behavior
If API fetch fails:
- Log error but don't break page
- Return empty completed tasks array
- Section simply won't render (graceful degradation)

### Future Enhancement: Task Details Link
- [ ] Add click handler to navigate to `/tasks/{id}` for full task details
- [ ] Show task status history
- [ ] Show full application and acceptance flow

## Dependencies
- Existing `<CompletedTasksSection />` component in `/src/features/professionals/components/sections/completed-tasks-section.tsx`
- `tasks` table in Supabase with proper status tracking
- `reviews` table for ratings and testimonials
- `date-fns` for date formatting (already installed)

## Priority
**Medium** - Shows proof of work and builds trust with customers

## Estimated Effort
- Database query design: 1 hour
- API implementation: 1.5 hours
- Data transformation: 1.5 hours
- Complexity calculation logic: 30 min
- Testing & edge cases: 1 hour
- **Total**: ~5.5 hours

## Follow-up Tasks
- [ ] Add pagination for professionals with 50+ completed tasks
- [ ] Add filtering (by category, by date range, by rating)
- [ ] Add "View Task Details" link for each task
- [ ] Add task images/photos (before/after) if available
- [ ] Add task timeline visualization
- [ ] Add export/share functionality (PDF of completed work)
- [ ] Add task statistics (average duration, success rate, etc.)
- [ ] Consider privacy controls for tasks (professional can hide specific tasks)
