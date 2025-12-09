# Refactor: Rename estimated_duration_hours to proposed_timeline

## Problem

There's a semantic mismatch in the application form:
- **UI Question**: "When can you start?" (asking about availability)
- **Options**: `today`, `within-3-days`, `within-week`, `flexible`
- **Storage**: `estimated_duration_hours` (INTEGER) with arbitrary hour mappings

The current implementation converts availability options to hours:
```typescript
// modal-config.ts
export const TIMELINE_HOURS_MAP: Record<string, number> = {
  today: 8,
  'within-3-days': 24,
  'within-week': 40,
  flexible: 80,
}
```

This is wrong because:
1. Professionals are answering WHEN they can start, not HOW LONG it will take
2. A professional can't estimate duration without seeing the task in person
3. The hour values are arbitrary and meaningless

## Solution

Rename `estimated_duration_hours` (INTEGER) to `proposed_timeline` (TEXT) and store the timeline string directly.

## Required Changes

### 1. Database Migration
- Rename column `estimated_duration_hours` to `proposed_timeline`
- Change type from INTEGER to TEXT
- Migrate existing data (convert hours back to timeline strings if possible, or set to NULL)

### 2. API Routes
- `src/app/api/applications/route.ts` - Accept `proposedTimeline` string
- `src/app/api/tasks/[id]/applications/route.ts` - Return `proposed_timeline`
- `src/app/api/professionals/[id]/route.ts` - Update field reference

### 3. Frontend Components
- `src/components/tasks/application-dialog/ApplicationDialog.tsx` - Send timeline string directly
- `src/components/tasks/application-dialog/modal-config.ts` - Remove TIMELINE_HOURS_MAP
- `src/app/[lang]/tasks/[id]/components/task-activity.tsx` - Display timeline string
- `src/app/[lang]/tasks/work/hooks/use-work-tasks.ts` - Display timeline string

### 4. Hooks & Types
- `src/hooks/use-applications.ts` - Update type and formatTimeline function
- `src/types/database.types.ts` - Change type from number to string
- `src/server/tasks/task.types.ts` - Change type

### 5. Remove
- `TIMELINE_HOURS_MAP` from `modal-config.ts`
- `TIMELINE_HOURS_MAP` export from `index.ts`

## Files with @todo comments
- `src/components/tasks/application-dialog/modal-config.ts`
- `src/components/tasks/application-dialog/ApplicationDialog.tsx`

## Priority
Medium - Semantic correctness, but current system works functionally

## Notes
- The `availability_date` field exists but is not being used - consider if it should be used instead
- Timeline options match what professionals expect to answer (when they can start)
