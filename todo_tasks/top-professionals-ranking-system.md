# Top Professionals Ranking & Featured System

## Task Description
Implement a ranking system that rewards active professionals with badges and visibility. Early adopters and top performers get featured placement and badges displayed on browse/detail pages.

## Requirements

### 1. Early Adopter Featured Status (Database Flag)
- **First 10 professionals per category** get `is_early_adopter = true`
- Tracked via `early_adopter_categories` array on users table
- Permanent status (doesn't expire)

### 2. Top Professional Badge (Rolling 30-Day Window)
- Professionals who complete **2+ tasks in last 30 days** earn badge
- **Rolling window**: Always checks last 30 days (no monthly resets)
- Single badge level for MVP (add bronze/silver/gold later)
- **PostgreSQL Trigger**: Automatically calculated when task status → 'completed'
- Badge expires 30 days after last qualifying task (filtered at query time)

**Badge Display Locations:**
- `/professionals` - Browse professionals page (on `ProfessionalCard` component)
- `/professionals/[id]` - Professional detail page (profile header)

### 3. Featured Professionals API Logic
**Priority order for `/api/professionals?featured=true`:**
1. DB-flagged featured professionals (`is_featured = true` OR `is_early_adopter = true`)
2. Current Top Professionals (`is_top_professional = true` AND not expired)
3. **Fallback**: Existing quality scoring algorithm (if not enough from above)


## Database Schema Changes (Simplified)

```sql
-- Add to users table (NO new tables needed for MVP)
ALTER TABLE users ADD COLUMN is_early_adopter BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN early_adopter_categories TEXT[] DEFAULT '{}'; -- Categories where they were first 10
ALTER TABLE users ADD COLUMN is_top_professional BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN top_professional_until TIMESTAMPTZ; -- Badge expiry
ALTER TABLE users ADD COLUMN top_professional_tasks_count INT DEFAULT 0; -- Cached count for display

-- For manual featuring (admin/pro subscribers)
ALTER TABLE users ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN featured_until TIMESTAMPTZ;

-- Index for featured queries
CREATE INDEX idx_users_featured ON users (is_featured, is_early_adopter, is_top_professional)
WHERE professional_title IS NOT NULL;
```

## Implementation Flow

### A. Early Adopter Assignment (One-time setup + ongoing)

```typescript
// Run once for existing data, then on each new professional registration
async function assignEarlyAdopterStatus(userId: string, category: string) {
  // Count existing professionals in this category
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .contains('service_categories', [category])
    .not('professional_title', 'is', null);

  // If less than 10, mark as early adopter for this category
  if (count < 10) {
    await supabase
      .from('users')
      .update({
        is_early_adopter: true,
        early_adopter_categories: supabase.sql`array_append(early_adopter_categories, ${category})`
      })
      .eq('id', userId);
  }
}
```

### B. Top Professional Badge (PostgreSQL Trigger - No Cron Needed)

```sql
-- Trigger function: runs automatically when task status changes to 'completed'
CREATE OR REPLACE FUNCTION update_professional_badge()
RETURNS TRIGGER AS $$
DECLARE
  task_count INT;
  prof_id UUID;
BEGIN
  -- Only run when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    prof_id := NEW.assigned_professional_id;

    -- Skip if no professional assigned
    IF prof_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Count tasks completed in last 30 days by this professional
    SELECT COUNT(*) INTO task_count
    FROM tasks
    WHERE assigned_professional_id = prof_id
      AND status = 'completed'
      AND completed_at >= NOW() - INTERVAL '30 days';

    -- Update professional's badge status
    UPDATE users SET
      is_top_professional = (task_count >= 2),
      top_professional_until = CASE
        WHEN task_count >= 2 THEN NOW() + INTERVAL '30 days'
        ELSE top_professional_until
      END,
      top_professional_tasks_count = task_count
    WHERE id = prof_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tasks table
CREATE TRIGGER on_task_completed
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_badge();
```

**How it works:**
1. Professional completes a task → trigger fires automatically
2. Counts their completed tasks in last 30 days
3. Updates badge status + expiry date on users table
4. No API code or cron jobs needed

### C. Featured Professionals Query (Updated)

```typescript
async function getFeaturedProfessionals(limit: number = 20): Promise<Professional[]> {
  const now = new Date().toISOString();

  // 1. First try: Get DB-flagged featured professionals
  const { data: dbFeatured } = await supabase
    .from('users')
    .select('*')
    .not('professional_title', 'is', null)
    .or(`is_featured.eq.true,is_early_adopter.eq.true,and(is_top_professional.eq.true,top_professional_until.gte.${now})`)
    .neq('is_banned', true)
    .limit(limit);

  // 2. If enough, return with diversity shuffling
  if (dbFeatured && dbFeatured.length >= limit) {
    return shuffleWithCategoryDiversity(dbFeatured, limit);
  }

  // 3. Fallback: Use existing quality scoring for remaining slots
  const remainingSlots = limit - (dbFeatured?.length || 0);
  const excludeIds = dbFeatured?.map(p => p.id) || [];

  const fallbackProfessionals = await getQualityScoredProfessionals(remainingSlots, excludeIds);

  return [...(dbFeatured || []), ...fallbackProfessionals];
}
```

## Acceptance Criteria

### Early Adopter Status
- [ ] Schema migration adds new fields to users table
- [ ] First 10 professionals per category get `is_early_adopter = true`
- [ ] `early_adopter_categories` tracks which categories they're early adopter for
- [ ] Badge displays on profile
- [ ] Badge displays in search results

### Top Professional Badge
- [ ] PostgreSQL trigger function `update_professional_badge()` created
- [ ] Trigger attached to `tasks` table (fires on status → 'completed')
- [ ] Badge awarded when 2+ tasks completed in last 30 days
- [ ] `top_professional_until` set to 30 days from calculation
- [ ] Badge filtered at query time via `top_professional_until >= NOW()`
- [ ] Tasks count cached in `top_professional_tasks_count`
- [ ] Badge displays on `ProfessionalCard` (browse professionals page)
- [ ] Badge displays on professional detail page header

### Featured API
- [ ] `GET /api/professionals?featured=true` checks DB flags first
- [ ] Falls back to quality scoring if not enough DB-flagged
- [ ] Category diversity maintained in results

## UI Components to Create

1. `TopProfessionalBadge` - Simple badge with task count tooltip
2. `EarlyAdopterBadge` - "Early Adopter" badge
3. `BadgeDisplay` - Shows badges on professional cards/profiles

## Translation Keys Required

```typescript
// professionals.ts
'professionals.badge.topProfessional': 'Top Professional',
'professionals.badge.topProfessional.tooltip': 'Completed {count} tasks in the last 30 days',
'professionals.badge.earlyAdopter': 'Early Adopter',
'professionals.badge.earlyAdopter.tooltip': 'One of the first professionals in {category}',
```

## Already Implemented (No Work Needed)
- **Task Invitations**: `POST /api/professionals/[id]/invite` - fully working
  - Creates in-app notification
  - Sends Telegram notification with magic link
  - Invitation banner in create-task flow
  - Duplicate invitation prevention

## Priority
High - Core engagement and retention feature

## Dependencies
- Telegram authentication (already implemented)
- Task invitations (already implemented)
- Tasks table with `status` and `assigned_professional_id` columns (already exists)
- Task completion flow (PostgreSQL trigger handles badge calculation automatically)

## Future Enhancements (Post-MVP)
- Badge levels (Bronze: 2+, Silver: 5+, Gold: 10+ tasks)
- Professional suggestion algorithm during task creation (priority sorting)
- Leaderboard page
- Monthly stats tracking table
- Analytics dashboard for professionals
