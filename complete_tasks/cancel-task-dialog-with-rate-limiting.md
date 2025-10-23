# Cancel Task Dialog with Rate Limiting

## Task Description
Implemented a friendly Cancel Task dialog that shows users their monthly cancellation limit and provides structured cancellation reasons. This prevents abuse while maintaining a positive user experience.

## Implementation Date
2025-10-23

## What Was Built

### 1. Cancel Task Dialog Component
**File**: `/src/components/tasks/cancel-task-dialog.tsx`

**Features**:
- Modal dialog with structured cancellation flow
- Rate limiting info banner (shows remaining cancellations)
- 6 predefined cancellation reasons:
  - Professional never showed up
  - Professional abandoned the work
  - Professional is unresponsive
  - My requirements changed
  - Found another solution
  - Other reason
- Optional description field for additional context
- Professional notification reminder
- Visual states: Normal, Last Warning, Limit Exceeded

**Rate Limiting Logic**:
- Users can cancel 1 task per month (configurable via `maxCancellationsPerMonth`)
- Shows remaining cancellations with friendly messaging
- Yellow warning banner when on last cancellation
- Red error banner when limit exceeded (disables cancel button)
- Friendly copy throughout: "Use it wisely!" instead of threatening

### 2. Integration with Posted Task Cards
**File**: `/src/components/ui/posted-task-card.tsx`

**Changes**:
- Cancel Task button now opens dialog instead of simple confirm
- Tracks `cancellationsThisMonth` (mock data, ready for API integration)
- Handler updated to receive reason + description
- Dialog passes professional name for context

**Handler**:
```typescript
const handleCancelTask = (reason: string, description?: string) => {
  console.log('Cancelling task:', id, { reason, description })
  // @todo INTEGRATION: Call API to cancel task
  // @todo INTEGRATION: Increment cancellationsThisMonth counter
  // @todo INTEGRATION: If exceeds limit, trigger account action/review
  setShowCancelDialog(false)
  router.refresh()
}
```

### 3. Translations (EN/BG/RU)
**Files**:
- `/src/lib/intl/en/notifications.ts`
- `/src/lib/intl/bg/notifications.ts`
- `/src/lib/intl/ru/notifications.ts`

**Translation Keys Added** (19 new keys):
```typescript
'cancelTask.title'
'cancelTask.professional'
'cancelTask.professionalNotification'
'cancelTask.reasonLabel'
'cancelTask.reasons.noShow'
'cancelTask.reasons.abandoned'
'cancelTask.reasons.unresponsive'
'cancelTask.reasons.changedRequirements'
'cancelTask.reasons.foundAlternative'
'cancelTask.reasons.other'
'cancelTask.descriptionLabel'
'cancelTask.descriptionPlaceholder'
'cancelTask.descriptionHint'
'cancelTask.confirmButton'
'cancelTask.rateLimit.title' // with {{remaining}} and {{max}} interpolation
'cancelTask.rateLimit.message'
'cancelTask.rateLimit.lastWarning'
'cancelTask.limitExceeded.title'
'cancelTask.limitExceeded.message'
```

## PRD Requirements Met
✅ Users can cancel 1 task per month
✅ Attempting more triggers visual feedback (not suspension yet - needs backend)
✅ Friendly, non-threatening UI
✅ Clear explanation of limits
✅ Structured cancellation reasons for analytics
✅ Professional notification reminder

## API Integration Points (TODO)

### Backend Endpoints Needed:
```typescript
// 1. Get user's cancellation count for current month
GET /api/users/me/cancellation-stats
Response: { cancellationsThisMonth: number, maxPerMonth: number }

// 2. Cancel task with reason
POST /api/tasks/:id/cancel
Body: {
  reason: 'professional_no_show' | 'professional_abandoned' | ...,
  description?: string
}
Response: { success: boolean, remainingCancellations: number }

// 3. Check if user can cancel (rate limit check)
GET /api/tasks/:id/can-cancel
Response: { canCancel: boolean, reason?: string }
```

### Database Changes Needed:
```sql
-- Track cancellations per user per month
CREATE TABLE user_task_cancellations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  cancelled_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_month (user_id, DATE_TRUNC('month', cancelled_at))
);

-- Or add to users table
ALTER TABLE users ADD COLUMN cancellations_this_month INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_cancellation_reset DATE;
```

### Suspension Logic (Future):
```typescript
// When cancellationsThisMonth > maxPerMonth:
// 1. Prevent further cancellations
// 2. Flag account for manual review
// 3. Send email to user explaining situation
// 4. Optional: Temporary suspension or warning strike
```

## User Experience Flow

### Scenario 1: First Cancellation (Normal)
1. User clicks "Cancel Task" on IN_PROGRESS task
2. Dialog opens with blue info banner: "You can cancel 1 more task(s) this month"
3. User selects reason and optionally adds description
4. Clicks "Cancel Task" button
5. Task cancelled, professional notified
6. Counter incremented: cancellationsThisMonth = 1

### Scenario 2: Last Cancellation (Warning)
1. Dialog opens with yellow warning banner
2. "This is your last free cancellation this month. Use it wisely!"
3. Same flow continues
4. After cancellation: cancellationsThisMonth = 1 (at limit)

### Scenario 3: Limit Exceeded (Blocked)
1. Dialog opens with red error banner
2. "Monthly cancellation limit reached"
3. Explains frequent cancellations may affect account
4. "Cancel Task" button is hidden/disabled
5. User must close dialog, contact support, or wait for next month

## Design Decisions

### Why 1 Cancellation Per Month?
- Prevents abuse (mass cancellations, professional harassment)
- Still allows legitimate cancellations (no-shows, emergencies)
- Encourages careful professional selection
- Can be adjusted based on analytics

### Why Not Immediate Suspension?
- More user-friendly to show limit first
- Gives users benefit of doubt (mistakes happen)
- Allows for legitimate edge cases
- Can escalate to suspension if pattern continues

### Why Structured Reasons?
- Enables analytics on why tasks are cancelled
- Helps identify problematic professionals
- Provides data for platform improvements
- Makes reporting easier

## Visual Design
- **NextUI Modal** - Clean, modern dialog
- **Color-coded banners**:
  - Blue (Info) - Normal state
  - Yellow (Warning) - Last cancellation
  - Red (Error) - Limit exceeded
- **Icons**: XCircle (cancel), AlertTriangle (warning), Info (information)
- **Smooth animations** - NextUI's built-in Framer Motion

## Testing Checklist
- [x] Dialog opens when Cancel Task clicked
- [x] Shows correct cancellation count (mock data)
- [x] All 6 reasons selectable
- [x] Description field optional
- [x] Confirm button disabled until reason selected
- [x] Close button works
- [x] Translations work in all 3 languages
- [ ] API integration (pending backend)
- [ ] Counter increments correctly
- [ ] Limit enforcement works
- [ ] Professional notification sent
- [ ] Task status updates to 'cancelled'

## Future Enhancements
1. **Reset Schedule**: Auto-reset counter on 1st of month
2. **Analytics Dashboard**: Show cancellation patterns to admins
3. **Professional Ratings**: Track cancellation reasons per professional
4. **Graduated Limits**: Higher limits for verified/trusted users
5. **Appeal Process**: Users can appeal suspension via support
6. **Notification**: Email user when approaching limit
7. **History View**: Show user their past cancellations

## Related Files
- `/src/components/tasks/cancel-task-dialog.tsx` - Dialog component
- `/src/components/ui/posted-task-card.tsx` - Integration point
- `/src/lib/intl/*/notifications.ts` - Translation keys
- `/todo_tasks/reopen-task-with-prefill.md` - Related feature

## Notes
- This is UI-only implementation with mock data
- Backend API integration marked with `@todo INTEGRATION` comments
- Ready for backend team to implement endpoints
- All user-facing copy reviewed for friendliness and clarity
