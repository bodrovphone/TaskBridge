# Database Cleanup: Old Applications

## Task Description
Implement automated cleanup of old, stale applications to keep the database lean and performant. This includes archiving/deleting rejected applications after a certain period and cleaning up applications for expired or completed tasks.

## Problem
As the platform grows, the `applications` table will accumulate millions of records:
- Rejected applications that are no longer relevant
- Applications for expired or cancelled tasks
- Applications for completed tasks (after review period)
- Withdrawn applications

These records consume storage, slow down queries, and provide no value after a certain time period.

## Requirements

### Cleanup Rules

#### 1. Rejected Applications
**Rule**: Delete rejected applications after 90 days
**Reason**:
- Professionals don't need to see old rejections
- Customers won't review rejected applications after task is complete
- Keep for 90 days in case of disputes

**Exception**: Keep if task is still open or in progress (edge case)

#### 2. Withdrawn Applications
**Rule**: Delete withdrawn applications after 30 days
**Reason**:
- Professional chose to withdraw, no longer relevant
- Shorter period since it's voluntary action

#### 3. Applications for Expired Tasks
**Rule**: Archive/delete all applications when task expires (14 days after creation with no acceptance)
**Reason**:
- Task is no longer active
- Applications have no value

#### 4. Applications for Cancelled Tasks
**Rule**: Archive/delete all applications when task is cancelled by customer
**Reason**:
- Task won't be completed
- Applications are obsolete

#### 5. Applications for Completed Tasks
**Rule**: Archive applications 180 days after task completion
**Reason**:
- Keep for review period and dispute resolution
- 6 months should be sufficient for any claims

#### 6. Pending Applications on Closed Tasks
**Rule**: Auto-reject pending applications when task status changes to anything other than 'open'
**Reason**:
- Clean up orphaned applications
- Professionals should know their application won't be considered

### Soft Delete vs Hard Delete

**Approach: Soft Delete First, Hard Delete Later**

**Soft Delete (Phase 1):**
- Add `archived_at` TIMESTAMPTZ field to `applications` table
- Archive instead of delete
- Query performance: Add `WHERE archived_at IS NULL` to active queries

**Hard Delete (Phase 2):**
- Delete archived records after 1 year
- Permanently remove from database
- Run quarterly cleanup job

**Benefits:**
- Ability to recover accidentally archived data
- Audit trail for disputes
- Gradual transition without data loss risk

## Implementation

### Database Schema Changes

```sql
-- Add archived_at field
ALTER TABLE applications
ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for cleanup queries
CREATE INDEX idx_applications_cleanup ON applications(status, created_at, archived_at)
WHERE archived_at IS NULL;

-- Add index for archived records
CREATE INDEX idx_applications_archived ON applications(archived_at)
WHERE archived_at IS NOT NULL;
```

### Cleanup Service

**Create `/src/lib/services/application-cleanup.ts`:**

```typescript
import { createAdminClient } from '@/lib/supabase/server';

interface CleanupStats {
  rejectedArchived: number;
  withdrawnArchived: number;
  expiredTasksArchived: number;
  cancelledTasksArchived: number;
  completedTasksArchived: number;
  pendingAutoRejected: number;
  hardDeleted: number;
}

/**
 * Archive old rejected applications (90 days)
 */
async function archiveRejectedApplications(): Promise<number> {
  const adminClient = createAdminClient();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data, error } = await adminClient
    .from('applications')
    .update({ archived_at: new Date().toISOString() })
    .eq('status', 'rejected')
    .is('archived_at', null)
    .lt('updated_at', ninetyDaysAgo.toISOString());

  if (error) {
    console.error('[Cleanup] Error archiving rejected applications:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Archive old withdrawn applications (30 days)
 */
async function archiveWithdrawnApplications(): Promise<number> {
  const adminClient = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await adminClient
    .from('applications')
    .update({ archived_at: new Date().toISOString() })
    .eq('status', 'withdrawn')
    .is('archived_at', null)
    .lt('withdrawn_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('[Cleanup] Error archiving withdrawn applications:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Archive applications for expired/cancelled tasks
 */
async function archiveApplicationsForClosedTasks(): Promise<{
  expired: number;
  cancelled: number;
}> {
  const adminClient = createAdminClient();

  // Get all expired/cancelled tasks
  const { data: closedTasks } = await adminClient
    .from('tasks')
    .select('id, status')
    .in('status', ['expired', 'cancelled']);

  if (!closedTasks || closedTasks.length === 0) {
    return { expired: 0, cancelled: 0 };
  }

  const taskIds = closedTasks.map(t => t.id);

  // Archive all applications for these tasks
  const { data, error } = await adminClient
    .from('applications')
    .update({ archived_at: new Date().toISOString() })
    .in('task_id', taskIds)
    .is('archived_at', null);

  if (error) {
    console.error('[Cleanup] Error archiving applications for closed tasks:', error);
    return { expired: 0, cancelled: 0 };
  }

  const expiredCount = data?.filter(app =>
    closedTasks.find(t => t.id === app.task_id && t.status === 'expired')
  ).length || 0;

  const cancelledCount = data?.filter(app =>
    closedTasks.find(t => t.id === app.task_id && t.status === 'cancelled')
  ).length || 0;

  return { expired: expiredCount, cancelled: cancelledCount };
}

/**
 * Archive applications for old completed tasks (180 days)
 */
async function archiveApplicationsForCompletedTasks(): Promise<number> {
  const adminClient = createAdminClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

  // Get completed tasks older than 180 days
  const { data: completedTasks } = await adminClient
    .from('tasks')
    .select('id')
    .eq('status', 'completed')
    .lt('completed_at', sixMonthsAgo.toISOString());

  if (!completedTasks || completedTasks.length === 0) {
    return 0;
  }

  const taskIds = completedTasks.map(t => t.id);

  const { data, error } = await adminClient
    .from('applications')
    .update({ archived_at: new Date().toISOString() })
    .in('task_id', taskIds)
    .is('archived_at', null);

  if (error) {
    console.error('[Cleanup] Error archiving applications for completed tasks:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Auto-reject pending applications for non-open tasks
 */
async function autoRejectPendingApplications(): Promise<number> {
  const adminClient = createAdminClient();

  // Get all non-open tasks
  const { data: nonOpenTasks } = await adminClient
    .from('tasks')
    .select('id')
    .neq('status', 'open');

  if (!nonOpenTasks || nonOpenTasks.length === 0) {
    return 0;
  }

  const taskIds = nonOpenTasks.map(t => t.id);

  // Auto-reject pending applications for these tasks
  const { data, error } = await adminClient
    .from('applications')
    .update({
      status: 'rejected',
      rejection_reason: 'Task is no longer accepting applications',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .in('task_id', taskIds)
    .eq('status', 'pending');

  if (error) {
    console.error('[Cleanup] Error auto-rejecting pending applications:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Hard delete archived records older than 1 year
 */
async function hardDeleteOldArchives(): Promise<number> {
  const adminClient = createAdminClient();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await adminClient
    .from('applications')
    .delete()
    .not('archived_at', 'is', null)
    .lt('archived_at', oneYearAgo.toISOString());

  if (error) {
    console.error('[Cleanup] Error hard deleting old archives:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Run full cleanup process
 */
export async function runApplicationCleanup(): Promise<CleanupStats> {
  console.log('[Cleanup] Starting application cleanup...');

  const stats: CleanupStats = {
    rejectedArchived: await archiveRejectedApplications(),
    withdrawnArchived: await archiveWithdrawnApplications(),
    expiredTasksArchived: 0,
    cancelledTasksArchived: 0,
    completedTasksArchived: await archiveApplicationsForCompletedTasks(),
    pendingAutoRejected: await autoRejectPendingApplications(),
    hardDeleted: await hardDeleteOldArchives()
  };

  const { expired, cancelled } = await archiveApplicationsForClosedTasks();
  stats.expiredTasksArchived = expired;
  stats.cancelledTasksArchived = cancelled;

  console.log('[Cleanup] Cleanup complete:', stats);

  return stats;
}
```

### Cron Job Setup

**Create `/src/app/api/cron/cleanup-applications/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { runApplicationCleanup } from '@/lib/services/application-cleanup';

/**
 * Application Cleanup Cron Job
 * Runs daily at 3:00 AM UTC
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await runApplicationCleanup();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    console.error('[Cleanup Cron] Error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}
```

**Update `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-applications",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### Update Active Queries

**Add to all application queries:**

```typescript
// Before (fetches all applications)
const { data } = await supabase
  .from('applications')
  .select('*')
  .eq('task_id', taskId);

// After (fetches only active applications)
const { data } = await supabase
  .from('applications')
  .select('*')
  .eq('task_id', taskId)
  .is('archived_at', null);  // ← Add this filter
```

**Files to update:**
- `/src/app/api/tasks/[id]/applications/route.ts`
- `/src/app/api/applications/route.ts` (if it exists)
- Any other application query endpoints

## Acceptance Criteria

### Database
- [ ] `archived_at` field added to applications table
- [ ] Indexes created for cleanup queries
- [ ] Soft delete filter added to all active application queries

### Cleanup Service
- [ ] Rejected applications archived after 90 days
- [ ] Withdrawn applications archived after 30 days
- [ ] Applications for expired/cancelled tasks archived immediately
- [ ] Applications for completed tasks archived after 180 days
- [ ] Pending applications auto-rejected for non-open tasks
- [ ] Archived records hard deleted after 1 year

### Cron Job
- [ ] Daily cron job configured and running
- [ ] Cron endpoint secured with secret
- [ ] Cleanup stats logged for monitoring
- [ ] Error handling and retry logic

### Monitoring
- [ ] Cleanup stats tracked in logs
- [ ] Alerts set up for cleanup failures
- [ ] Weekly cleanup summary reports

## Testing

### Manual Testing
```sql
-- Test archived_at filtering
SELECT COUNT(*) FROM applications WHERE archived_at IS NULL;

-- Test cleanup on old rejected applications
SELECT COUNT(*) FROM applications
WHERE status = 'rejected'
AND created_at < NOW() - INTERVAL '90 days'
AND archived_at IS NULL;

-- Verify indexes
SELECT * FROM pg_indexes WHERE tablename = 'applications';
```

### Cleanup Dry Run
Add dry-run mode to cleanup service:

```typescript
export async function runApplicationCleanup(dryRun = false): Promise<CleanupStats> {
  if (dryRun) {
    console.log('[Cleanup] DRY RUN - No changes will be made');
    // Count records that would be affected
    // Return stats without updating database
  }
  // ... actual cleanup
}
```

## Technical Notes

### Performance Considerations
1. **Batch Processing**: Archive in batches of 1000 records to avoid long-running transactions
2. **Off-peak Hours**: Run cleanup at 3 AM UTC when traffic is lowest
3. **Indexes**: Ensure cleanup queries use indexes efficiently
4. **Monitoring**: Track query execution time and alert if > 5 seconds

### Storage Savings Estimate
Assuming:
- Average application size: 2 KB (JSON data, text fields)
- 10,000 applications created per month
- 80% rejection rate

**Without cleanup:**
- Year 1: 10k × 12 × 2 KB = 240 MB
- Year 2: 10k × 24 × 2 KB = 480 MB
- Year 5: 10k × 60 × 2 KB = 1.2 GB

**With cleanup:**
- Steady state: ~2-3 months of data = 40-60 MB
- **Savings: 95% reduction in storage**

### Recovery Process
If archived data needs to be recovered:

```sql
-- Unarchive specific application
UPDATE applications
SET archived_at = NULL
WHERE id = 'application-id';

-- Unarchive all applications for a task
UPDATE applications
SET archived_at = NULL
WHERE task_id = 'task-id';
```

## Priority

**Medium-High** - Not urgent for MVP, but important for long-term database health

Recommended timeline:
- **Phase 1** (Month 3): Implement soft delete and active filtering
- **Phase 2** (Month 6): Add automated cleanup cron job
- **Phase 3** (Month 12): Implement hard delete for old archives

## Estimated Effort

- **Database Schema**: 1 hour
- **Cleanup Service**: 4 hours
- **Cron Job Setup**: 2 hours
- **Query Updates**: 3 hours
- **Testing & Monitoring**: 2 hours
- **Total**: ~12 hours (~2 days)

## Success Metrics

- [ ] Database size growth rate reduced by 80%+
- [ ] Application table query performance maintained as data grows
- [ ] Zero data loss incidents
- [ ] Successful daily cleanup runs (99%+ success rate)
- [ ] All active queries exclude archived records

## Risks & Mitigations

### Risk 1: Accidentally deleting needed data
**Mitigation:**
- Soft delete first (keep for 1 year)
- Manual review before enabling hard delete
- Backup database before first cleanup run

### Risk 2: Query performance degradation
**Mitigation:**
- Proper indexes on `archived_at` field
- Regular VACUUM and ANALYZE on applications table
- Monitor query execution times

### Risk 3: Cron job failures
**Mitigation:**
- Error logging and alerting
- Retry logic with exponential backoff
- Manual trigger endpoint as backup

## Related Files

### Files to Create
- `/src/lib/services/application-cleanup.ts` - Cleanup logic
- `/src/app/api/cron/cleanup-applications/route.ts` - Cron endpoint

### Files to Modify
- `/src/app/api/tasks/[id]/applications/route.ts` - Add archived_at filter
- `/src/app/api/applications/route.ts` - Add archived_at filter
- `/vercel.json` - Add cron schedule
- `/supabase/migrations/add_application_archiving.sql` - Schema changes

## Future Enhancements

### Phase 4: Analytics Dashboard
- Show cleanup stats in admin dashboard
- Track storage savings over time
- Alert on anomalies (e.g., sudden spike in applications)

### Phase 5: Application Archive View
- Allow admins to browse archived applications
- Search and filter archived records
- Restore individual archived applications if needed

### Phase 6: Automatic Task Expiry
- Expire tasks with no applications after 14 days
- Notify customer before expiring
- Offer to repost with better visibility

---

**Status**: Ready for implementation
**Last Updated**: 2025-01-04
**Priority**: Medium-High - Important for database health after launch
**Recommended Start**: Month 3-6 after MVP launch
