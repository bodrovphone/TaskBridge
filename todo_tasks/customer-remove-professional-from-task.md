# Customer Remove Professional from Task

## Task Description
Allow customers to remove an assigned professional from their IN_PROGRESS task and reopen it for new applications. This provides customers an escape route when the accepted professional is unresponsive, delivers poor quality, or when circumstances change - while protecting against abuse through rate limiting.

## Current Status
- Customers can view IN_PROGRESS tasks
- Customers can mark tasks as complete
- Customers can report scam/fraud issues
- No way to remove professional and reopen task
- CancelTaskDialog exists but only cancels the task entirely (not reassignment)

## User Scenario

### Scenario 1: Unresponsive Professional
**Situation**: Customer accepts professional for plumbing repair, but professional hasn't shown up in 3 days
- Tries messaging - no response
- Professional accepted but ghosted
- Customer needs work done urgently
- Removes professional, reopens task

### Scenario 2: Quality Concerns During Work
**Situation**: Professional started electrical work but customer notices safety issues
- Work quality doesn't meet standards
- Professional dismissive of concerns
- Customer wants different professional
- Removes current one, seeks better option

### Scenario 3: Scope/Timeline Changed
**Situation**: Customer's circumstances changed after accepting professional
- Original deadline no longer works
- Budget constraints changed
- Different approach needed
- Fair to let professional go, reopen task

### Scenario 4: Professional No Longer Available
**Situation**: Professional accepted but then had emergency (communicated)
- Professional asks to be removed
- Customer agrees and wants to find replacement
- Mutual agreement to end assignment

## Requirements

### 1. Remove Professional Button Location

#### On "My Posted Tasks" Page (IN_PROGRESS filter)
Show "Remove Professional" button on task cards:
```typescript
{status === 'in_progress' && acceptedApplication && (
  <Button
    size="sm"
    variant="bordered"
    color="warning"
    startContent={<UserX className="w-4 h-4" />}
    onPress={() => setShowRemoveDialog(true)}
  >
    {t('postedTasks.removeProfessional')}
  </Button>
)}
```

#### On Task Detail Page
When viewing own IN_PROGRESS task as customer:
```typescript
{isCustomer && isMyTask && status === 'in_progress' && (
  <Button
    variant="bordered"
    color="warning"
    startContent={<UserX className="w-4 h-4" />}
    onPress={() => setShowRemoveDialog(true)}
  >
    {t('taskDetail.customer.removeProfessional')}
  </Button>
)}
```

### 2. Remove Professional Dialog Component

**File**: `/src/components/tasks/customer-remove-professional-dialog.tsx`

**Features**:
- Rate limiting info (1 removal per month - stricter than professional withdrawal)
- Customer can only remove 1 professional per month
- Structured removal reasons
- Impact warning (professional will be notified)
- Task will reopen for new applications

**Dialog Structure**:
```typescript
interface CustomerRemoveProfessionalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, description?: string) => void
  taskTitle: string
  professionalName: string
  professionalAvatar?: string
  removalsThisMonth: number
  maxRemovalsPerMonth: number
  taskBudget: number
  acceptedDate: Date
  hasWorkStarted?: boolean // If professional uploaded photos/marked progress
}
```

### 3. Removal Reasons

Customer-specific reasons:
- **Professional unresponsive** - Not answering messages or calls
- **Professional didn't show up** - Missed scheduled appointment(s)
- **Quality concerns** - Work not meeting expected standards
- **Safety issues** - Work poses safety risks or violations
- **Timeline not working** - Can't meet customer's deadline
- **Scope disagreement** - Professional wants to change agreed scope/price
- **My circumstances changed** - Customer's situation changed
- **Mutual agreement** - Both parties agreed to end assignment
- **Other reason** - Free text explanation

### 4. Rate Limiting Rules

#### Customer Limits (Stricter than Professional)
- **1 removal per month** (vs 2 for professionals)
- **Rationale**: Customers control hiring decisions, should be more careful
- **Consequences**:
  - 2nd removal: Warning strike + account review
  - 3rd+ removal: Pattern of poor hiring decisions
  - May require identity verification for future tasks

#### Time-Based Considerations
Removing early vs late doesn't change limit, but tracked for patterns:
```typescript
const timeSinceAcceptance = Date.now() - acceptedDate

// Very early removal (< 24 hours) - may indicate hasty hiring
if (timeSinceAcceptance < 24 * 60 * 60 * 1000) {
  pattern = 'hasty_hiring'
  note = 'Customer accepted then quickly removed'
}

// Early removal (< 3 days) - reasonable time to assess
else if (timeSinceAcceptance < 3 * 24 * 60 * 60 * 1000) {
  pattern = 'normal'
  note = 'Gave professional reasonable time'
}

// Late removal (> 7 days) - may indicate communication issues
else {
  pattern = 'late_removal'
  note = 'Professional worked for extended period before removal'
}
```

### 5. Dialog Content

#### Warning Banner (Always Show)
```typescript
<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
  <p className="text-sm text-yellow-900">
    <strong>{t('customerRemove.limitWarning.title')}</strong>
  </p>
  <p className="text-xs text-yellow-800 mt-1">
    {t('customerRemove.limitWarning.message', {
      remaining: maxRemovalsPerMonth - removalsThisMonth,
      max: maxRemovalsPerMonth
    })}
  </p>
</div>
```

#### Professional Info Display
```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
  <div className="flex items-center gap-3">
    {professionalAvatar && (
      <Avatar src={professionalAvatar} size="lg" />
    )}
    <div className="flex-1">
      <p className="font-semibold text-gray-900">{professionalName}</p>
      <p className="text-sm text-gray-600">
        {t('customerRemove.acceptedOn')}: {formatDate(acceptedDate)}
      </p>
      <p className="text-sm text-gray-600">
        {t('customerRemove.workingFor')}: {getDaysWorking(acceptedDate)} {t('common.days')}
      </p>
    </div>
  </div>
</div>
```

#### Limit Exceeded Warning
```typescript
{removalsThisMonth >= maxRemovalsPerMonth && (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
    <p className="text-sm font-semibold text-red-900">
      {t('customerRemove.limitExceeded.title')}
    </p>
    <p className="text-xs text-red-800 mt-1">
      {t('customerRemove.limitExceeded.message')}
    </p>
  </div>
)}
```

### 6. Impact on Task Status

When customer removes professional:
```typescript
// Task status changes
status: 'in_progress' → 'open'

// Clear professional assignment
selectedProfessionalId: null
acceptedApplicationId: null

// Update application status
application.status: 'accepted' → 'removed_by_customer'
application.removedAt: new Date()
application.removalReason: reason

// Notify professional
notification: {
  type: 'removed_by_customer',
  message: 'You were removed from task "{{taskTitle}}" by the customer',
  severity: 'warning'
}

// Make task visible in browse again
visibility: 'open_for_applications'
```

### 7. Reputation Impact

Track removal patterns for both parties:

```typescript
// Customer profile stats
interface CustomerStats {
  totalProfessionalsHired: number
  professionalsRemoved: number
  removalRate: number // removed / hired
  avgTimeBeforeRemoval: number // days

  // Flags
  hasHighRemovalRate: boolean // > 30%
  hasHastyRemovalPattern: boolean // avg < 24 hours
}

// Show warning on customer profile (visible to professionals)
if (removalRate > 0.25) {
  <Badge color="warning">
    Removed {{removedCount}} of {{hiredCount}} professionals
  </Badge>
}

// Professional application stats
interface ApplicationImpactStats {
  wasRemovedByCustomer: boolean
  removalReason: string
  daysWorked: number

  // This does NOT negatively affect professional rating
  // unless pattern emerges (multiple removals for quality issues)
}
```

### 8. Professional Notification

Immediate notification when removed:
```typescript
// Email to professional
Subject: Task assignment ended

Body:
"Hi {{professionalName}},

The customer has ended your assignment for task "{{taskTitle}}".

Reason: {{translatedReason}}

This does not negatively affect your professional rating unless there are quality or safety concerns.

The task is now available for other professionals to apply.

If you have questions, please contact support.

The TaskBridge Team"
```

### 9. Re-hiring Rules

After removal, when can customer accept same professional again?

```typescript
const canRehireProfessional = (
  customerId: string,
  professionalId: string,
  taskId: string
) => {
  const removal = getRemovalRecord(customerId, professionalId, taskId)

  if (!removal) return true

  const daysSinceRemoval =
    (Date.now() - removal.removedAt) / (1000 * 60 * 60 * 24)

  // Mutual agreement - can re-hire anytime
  if (removal.reason === 'mutual_agreement') {
    return true
  }

  // Quality/safety issues - cannot re-hire for same task
  if (['quality_concerns', 'safety_issues'].includes(removal.reason)) {
    return false
  }

  // Other reasons - 7 day cooloff
  return daysSinceRemoval > 7
}
```

### 10. Professional Re-application Rules

Can removed professional apply again to same task?

```typescript
const canProfessionalReapply = (
  professionalId: string,
  taskId: string
) => {
  const removal = getRemovalRecord(null, professionalId, taskId)

  if (!removal) return true

  // Quality/safety concerns - cannot reapply
  if (['quality_concerns', 'safety_issues'].includes(removal.removalReason)) {
    return false
  }

  // Mutual agreement or circumstances changed - can reapply
  if (['mutual_agreement', 'my_circumstances_changed'].includes(removal.removalReason)) {
    return true
  }

  // Other reasons - can reapply after 7 days
  const daysSinceRemoval =
    (Date.now() - removal.removedAt) / (1000 * 60 * 60 * 24)
  return daysSinceRemoval > 7
}
```

## Acceptance Criteria

- [ ] "Remove Professional" button appears on IN_PROGRESS tasks in My Posted Tasks page
- [ ] "Remove Professional" button appears on task detail page for customer
- [ ] Dialog shows professional info (name, avatar, days working)
- [ ] Dialog shows rate limiting info (1 removal per month)
- [ ] 9 removal reasons available with radio selection
- [ ] Optional description field for context
- [ ] Warning shown when at/near monthly limit
- [ ] Professional receives immediate notification
- [ ] Task status changes back to OPEN
- [ ] Professional assignment cleared from task
- [ ] Application status marked as 'removed_by_customer'
- [ ] Removal tracked in customer stats
- [ ] High removal rate shown on customer profile (visible to professionals)
- [ ] Re-hiring rules enforced based on removal reason
- [ ] Full i18n support (EN/BG/RU)

## Technical Implementation

### Database Changes

```sql
-- Add removal tracking to applications
ALTER TABLE applications ADD COLUMN removed_by_customer_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN removal_reason VARCHAR(50);
ALTER TABLE applications ADD COLUMN removal_description TEXT;
ALTER TABLE applications ADD COLUMN days_worked_before_removal INT;

-- Track customer removals
CREATE TABLE customer_professional_removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  days_worked INT NOT NULL,
  removed_at TIMESTAMP DEFAULT NOW(),
  month_year VARCHAR(7) DEFAULT TO_CHAR(NOW(), 'YYYY-MM'), -- '2025-11'
  INDEX idx_customer_month (customer_id, month_year),
  INDEX idx_professional_removals (professional_id)
);

-- Add stats to customer profile
ALTER TABLE users ADD COLUMN total_professionals_removed INT DEFAULT 0;
ALTER TABLE users ADD COLUMN removals_this_month INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_removal_reset DATE;
ALTER TABLE users ADD COLUMN removal_rate DECIMAL(5,4); -- professionals removed / hired

-- Track re-hiring restrictions
CREATE TABLE customer_professional_restrictions (
  customer_id UUID REFERENCES users(id),
  professional_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  can_rehire_at TIMESTAMP, -- NULL means never for this task
  reason VARCHAR(100),
  PRIMARY KEY (customer_id, professional_id, task_id)
);
```

### API Endpoints

```typescript
// 1. Get customer's removal stats
GET /api/customers/me/removal-stats
Response: {
  removalsThisMonth: number,
  maxPerMonth: number,
  totalRemovals: number,
  removalRate: number,
  canRemove: boolean
}

// 2. Remove professional from task
POST /api/tasks/:taskId/remove-professional
Body: {
  reason: string,
  description?: string
}
Response: {
  success: boolean,
  professionalNotified: boolean,
  remainingRemovals: number
}

// 3. Check if can remove professional
GET /api/tasks/:taskId/can-remove-professional
Response: {
  canRemove: boolean,
  reason?: string,
  daysWorking: number,
  hasWorkStarted: boolean
}

// 4. Check if can re-hire professional
GET /api/tasks/:taskId/can-rehire/:professionalId
Response: {
  canRehire: boolean,
  reason?: string,
  cooloffEndsAt?: Date
}
```

### Removal Handler

```typescript
// /src/lib/services/customer-remove-professional.ts
export async function removeProfessionalFromTask(
  taskId: string,
  customerId: string,
  reason: string,
  description?: string
) {
  // Get task and application
  const task = await getTask(taskId)
  const application = await getAcceptedApplication(taskId)

  if (!application || task.customerId !== customerId) {
    throw new Error('Unauthorized')
  }

  // Calculate days worked
  const daysWorked = Math.floor(
    (Date.now() - application.acceptedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Update task
  await updateTask(taskId, {
    status: 'open',
    selectedProfessionalId: null,
    acceptedApplicationId: null
  })

  // Update application
  await updateApplication(application.id, {
    status: 'removed_by_customer',
    removedByCustomerAt: new Date(),
    removalReason: reason,
    removalDescription: description,
    daysWorkedBeforeRemoval: daysWorked
  })

  // Track removal
  await trackCustomerRemoval({
    customerId,
    professionalId: application.professionalId,
    taskId,
    applicationId: application.id,
    reason,
    description,
    daysWorked
  })

  // Increment customer counter
  await incrementCustomerRemovals(customerId)

  // Set re-hiring restrictions if applicable
  if (['quality_concerns', 'safety_issues'].includes(reason)) {
    await setPermanentRestriction(customerId, application.professionalId, taskId)
  } else if (reason !== 'mutual_agreement') {
    await setRestriction(customerId, application.professionalId, taskId, 7) // days
  }

  // Notify professional
  await createNotification({
    userId: application.professionalId,
    type: 'removed_by_customer',
    taskId,
    data: {
      taskTitle: task.title,
      customerName: task.customerName,
      reason: translateReason(reason)
    }
  })

  // Send email
  await sendRemovalEmail(application.professionalId, {
    taskTitle: task.title,
    reason: translateReason(reason),
    daysWorked
  })

  return {
    success: true,
    professionalNotified: true
  }
}
```

## Translation Keys

### English

```typescript
// In postedTasks.ts
'postedTasks.removeProfessional': 'Remove Professional',
'postedTasks.cannotRemove': 'Cannot remove',

// In taskDetail.ts
'taskDetail.customer.removeProfessional': 'Remove Professional',

// In customerRemove.ts (new file)
'customerRemove.title': 'Remove Professional from Task',
'customerRemove.subtitle': 'Removing from: {{taskTitle}}',
'customerRemove.professional': 'Professional',
'customerRemove.acceptedOn': 'Accepted on',
'customerRemove.workingFor': 'Working for',
'customerRemove.professionalNotification': 'The professional will be notified and your task will be reopened for new applications',

// Rate limiting
'customerRemove.limitWarning.title': 'You can remove {{remaining}} more professional(s) this month',
'customerRemove.limitWarning.message': 'Customers can remove up to {{max}} professional per month. Frequent removals may indicate poor hiring decisions.',
'customerRemove.limitExceeded.title': 'Monthly removal limit reached',
'customerRemove.limitExceeded.message': 'You\'ve reached your removal limit for this month. Please contact support if you have a serious issue.',

// Reasons
'customerRemove.reasonLabel': 'Why are you removing this professional?',
'customerRemove.reasons.professional_unresponsive': 'Professional not responding to messages',
'customerRemove.reasons.professional_no_show': 'Professional missed scheduled appointments',
'customerRemove.reasons.quality_concerns': 'Work quality not meeting standards',
'customerRemove.reasons.safety_issues': 'Safety concerns with the work',
'customerRemove.reasons.timeline_issue': 'Cannot meet my deadline',
'customerRemove.reasons.scope_disagreement': 'Disagreement about scope or price',
'customerRemove.reasons.my_circumstances_changed': 'My circumstances have changed',
'customerRemove.reasons.mutual_agreement': 'Mutual agreement to end assignment',
'customerRemove.reasons.other': 'Other reason',

// Form
'customerRemove.descriptionLabel': 'Additional details',
'customerRemove.descriptionPlaceholder': 'Please explain the situation...',
'customerRemove.descriptionHint': 'This helps us improve the platform',
'customerRemove.confirmButton': 'Remove Professional',
'customerRemove.taskWillReopen': 'Your task will be reopened for new applications',

// Success/error
'customerRemove.success': 'Professional removed. Your task is now open for new applications.',
'customerRemove.error': 'Unable to remove professional. Please try again or contact support.',
```

### Russian & Bulgarian
Similar translations in both languages.

## User Flow Examples

### Example 1: Unresponsive Professional
1. Customer accepts electrician for 500 BGN job
2. Day 1: Professional confirms, says will come tomorrow
3. Day 2: Professional doesn't show up
4. Day 3: Customer messages - no response
5. Day 4: Customer opens "My Posted Tasks"
6. Clicks "Remove Professional" on task card
7. Dialog shows: "You can remove 1 more professional this month"
8. Selects reason: "Professional not responding to messages"
9. Adds description: "Confirmed appointment but didn't show up and stopped responding"
10. Clicks "Remove Professional"
11. Task returns to OPEN status
12. Professional receives notification
13. Customer starts reviewing new applications

### Example 2: Quality Concerns
1. Customer hires plumber for bathroom work
2. Day 2: Work started but customer notices poor quality
3. Customer discusses concerns with professional
4. Professional dismissive, says "it's fine"
5. Customer decides to find different professional
6. Opens task detail page
7. Clicks "Remove Professional"
8. Dialog shows professional has been working 2 days
9. Selects reason: "Work quality not meeting standards"
10. Adds description with specific concerns
11. Confirms removal
12. Task reopens, professional cannot reapply (quality concerns)
13. Customer finds better professional

### Example 3: Mutual Agreement
1. Customer accepts professional for renovation
2. Professional's family emergency comes up
3. Professional messages customer explaining situation
4. Both agree it's best to end assignment
5. Professional asks customer to remove them
6. Customer clicks "Remove Professional"
7. Selects: "Mutual agreement to end assignment"
8. No penalties, no restrictions
9. Professional can reapply if emergency resolves
10. Task reopens with good faith on both sides

## Customer Profile Display

Show removal stats on customer profile (visible to professionals):
```typescript
// If removal rate > 20%
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
  <div className="flex items-center gap-2">
    <AlertTriangle className="w-4 h-4 text-yellow-600" />
    <span className="text-sm text-yellow-900">
      Removed {{removedCount}} of {{hiredCount}} professionals
    </span>
  </div>
</div>

// If removal rate > 40%
<div className="bg-red-50 border border-red-200 rounded-lg p-3">
  <div className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4 text-red-600" />
    <span className="text-sm font-semibold text-red-900">
      High removal rate: {{removalRate}}%
    </span>
  </div>
  <p className="text-xs text-red-700 mt-1">
    This customer frequently removes accepted professionals
  </p>
</div>
```

## Admin Dashboard

Track removal patterns:
- Customers with > 2 removals this quarter
- Professionals removed multiple times by different customers
- Removal reasons breakdown (identify systemic issues)
- Average time from acceptance to removal
- Tasks with multiple professional changes
- Correlation between removal rate and task complexity/budget

## Priority
**High** - Important for marketplace balance and customer flexibility

## Dependencies
- My Posted Tasks page (customer dashboard)
- Task detail page
- Notification system
- Email system
- Customer profile stats
- Professional application system

## Related Features
- Professional Withdraw (opposite flow) - to be implemented
- My Posted Tasks page - exists, needs remove button
- Customer reputation system
- Task lifecycle management

## Success Metrics
- % of removals by reason category
- Average time from acceptance to removal
- Removal rate per customer
- Professional satisfaction after removal (survey)
- Re-application success rate after removal
- Task completion rate after professional change

## Notes
- Stricter than professional withdrawal (1 vs 2 per month)
- No "early removal grace period" (all removals count)
- Focus on legitimate use cases while preventing abuse
- Balance customer control with professional protection
- Quality/safety removals prevent re-hiring (serious issues)
- Mutual agreement removals have no penalties (good faith)
