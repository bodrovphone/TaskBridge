# Professional Withdraw from Accepted Task

## Task Description
Allow professionals to withdraw from accepted tasks they haven't started working on yet. This gives professionals an escape route if they can't fulfill the commitment, while protecting against abuse through rate limiting similar to the customer cancellation system.

## Current Status
- Professionals can apply to tasks
- Professionals can see accepted applications in "My Work" page
- No withdraw/cancel functionality exists for professionals
- Customer can cancel tasks (implemented with rate limiting)

## User Scenario

### Scenario 1: Legitimate Withdrawal
**Situation**: Professional accepts a plumbing task, then gets hospitalized
- Can't fulfill commitment
- Needs to withdraw gracefully
- Customer should be notified immediately
- Task should go back to OPEN status

### Scenario 2: Changed Mind
**Situation**: Professional accepts task, sees it's more work than expected
- Realizes they can't do it for the agreed budget
- Withdraws before starting work
- Better to withdraw early than do poor job

### Scenario 3: Customer Issues
**Situation**: Customer is unresponsive or rude in messages
- Professional doesn't want to work with them
- Withdraws to avoid conflict
- Task returns to available pool

## Requirements

### 1. Withdraw Button Location

#### On "My Work" Page
Show "Withdraw" button on IN_PROGRESS tasks:
```typescript
// Only show before work actually starts
{status === 'in_progress' && !workStarted && (
  <Button
    size="sm"
    variant="bordered"
    color="warning"
    startContent={<LogOut className="w-4 h-4" />}
    onPress={() => setShowWithdrawDialog(true)}
  >
    {t('myWork.withdrawFromTask')}
  </Button>
)}
```

#### On Task Detail Page
When viewing assigned task as professional:
```typescript
{isProfessional && isAssignedToMe && status === 'in_progress' && (
  <Button
    variant="bordered"
    color="warning"
    startContent={<LogOut className="w-4 h-4" />}
    onPress={() => setShowWithdrawDialog(true)}
  >
    {t('taskDetail.professional.withdraw')}
  </Button>
)}
```

### 2. Withdraw Dialog Component

**File**: `/src/components/tasks/professional-withdraw-dialog.tsx`

**Features**:
- Rate limiting info (similar to customer cancel dialog)
- Professional can withdraw 2 tasks per month (more lenient than customer)
- Structured withdrawal reasons
- Impact warning (affects reputation)
- Customer notification reminder

**Dialog Structure**:
```typescript
interface ProfessionalWithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, description?: string) => void
  taskTitle: string
  customerName: string
  withdrawalsThisMonth: number
  maxWithdrawalsPerMonth: number
  taskBudget: number
  acceptedDate: Date
}
```

### 3. Withdrawal Reasons

Professional-specific reasons:
- **Health/emergency** - Unexpected personal situation
- **Capacity issue** - Overbooked or underestimated time
- **Scope mismatch** - Task different than expected
- **Customer unresponsive** - Can't get necessary information
- **Location issue** - Can't reach location or it's unsafe
- **Budget dispute** - Customer wants to renegotiate price
- **Equipment issue** - Don't have necessary tools/materials
- **Other reason** - Free text explanation

### 4. Rate Limiting Rules

#### Professional Limits (More Lenient)
- **2 withdrawals per month** (vs 1 for customers)
- **Rationale**: Professionals juggle multiple tasks, need flexibility
- **Consequences**:
  - 3rd withdrawal: Warning strike
  - 4th+ withdrawal: Account review
  - Pattern of withdrawals: Temporary suspension

#### Time-Based Penalties
Withdrawing late has more impact:
```typescript
const timeSinceAcceptance = Date.now() - acceptedDate

// Early withdrawal (< 2 hours) - minimal impact
if (timeSinceAcceptance < 2 * 60 * 60 * 1000) {
  impact = 'low'
  penalty = 'none'
}

// Same day (< 24 hours) - medium impact
else if (timeSinceAcceptance < 24 * 60 * 60 * 1000) {
  impact = 'medium'
  penalty = 'counts toward limit'
}

// Late withdrawal (> 24 hours) - high impact
else {
  impact = 'high'
  penalty = 'counts toward limit + reputation hit'
}
```

### 5. Dialog Content Based on Timing

#### Early Withdrawal (< 2 hours)
```typescript
<div className="bg-blue-50 border-l-4 border-blue-400 p-4">
  <p className="text-sm text-blue-900">
    <strong>Early withdrawal</strong> - Accepted less than 2 hours ago.
    This won't count toward your monthly limit.
  </p>
</div>
```

#### Normal Withdrawal (< 24 hours)
```typescript
<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
  <p className="text-sm text-yellow-900">
    <strong>You can withdraw {{remaining}} more time(s) this month</strong>
  </p>
  <p className="text-xs text-yellow-800 mt-1">
    Frequent withdrawals may affect your reputation and account standing.
  </p>
</div>
```

#### Late Withdrawal (> 24 hours)
```typescript
<div className="bg-red-50 border-l-4 border-red-400 p-4">
  <p className="text-sm font-semibold text-red-900">
    Late withdrawal notice
  </p>
  <p className="text-xs text-red-800 mt-1">
    Withdrawing more than 24 hours after acceptance significantly impacts
    the customer and may affect your professional rating.
  </p>
</div>
```

### 6. Impact on Task Status

When professional withdraws:
```typescript
// Task status changes
status: 'in_progress' → 'open'

// Clear professional assignment
selectedProfessionalId: null
acceptedApplicationId: null

// Notify customer
notification: {
  type: 'professional_withdrew',
  message: '{{professionalName}} withdrew from your task "{{taskTitle}}"',
  severity: 'warning'
}

// Professional's application marked as withdrawn
application.status: 'accepted' → 'withdrawn'
application.withdrawnAt: new Date()
application.withdrawReason: reason
```

### 7. Reputation Impact

Track withdrawal patterns:
```typescript
// Professional profile stats
interface ProfessionalStats {
  totalTasksAccepted: number
  tasksCompleted: number
  tasksWithdrawn: number
  withdrawalRate: number // withdrawn / accepted
  avgWithdrawalTime: number // hours from acceptance

  // Flags
  hasHighWithdrawalRate: boolean // > 20%
  hasLateWithdrawalPattern: boolean // avg > 24 hours
}

// Show on professional profile
if (withdrawalRate > 0.15) {
  <Badge color="warning">
    {{withdrawnCount}} withdrawals from {{acceptedCount}} accepted tasks
  </Badge>
}
```

### 8. Customer Notification

Immediate notification when professional withdraws:
```typescript
// Email to customer
Subject: Professional withdrew from your task

Body:
"Hi {{customerName}},

{{professionalName}} has withdrawn from your task "{{taskTitle}}".

Your task is now open again and available for other professionals to apply.

We recommend:
- Reviewing your task details
- Checking if budget is competitive
- Responding to new applications quickly

View your task: [Link]

The TaskBridge Team"
```

### 9. Re-application Rules

After withdrawing, when can professional re-apply?
```typescript
// Cooling-off period
const canReapply = (professionalId: string, taskId: string) => {
  const withdrawal = getWithdrawal(professionalId, taskId)

  if (!withdrawal) return true

  const hoursSinceWithdrawal =
    (Date.now() - withdrawal.withdrawnAt) / (1000 * 60 * 60)

  // Early withdrawal: can reapply immediately if customer invites
  if (withdrawal.timingImpact === 'low') {
    return withdrawal.customerInvited === true
  }

  // Normal withdrawal: 48 hour cooling-off
  if (withdrawal.timingImpact === 'medium') {
    return hoursSinceWithdrawal > 48
  }

  // Late withdrawal: cannot reapply to same task
  if (withdrawal.timingImpact === 'high') {
    return false
  }
}
```

## Acceptance Criteria

- [ ] "Withdraw" button appears on IN_PROGRESS tasks in My Work page
- [ ] "Withdraw" button appears on task detail page for assigned professional
- [ ] Withdraw dialog shows rate limiting info
- [ ] 8 withdrawal reasons available with radio selection
- [ ] Optional description field for context
- [ ] Early withdrawal (< 2 hours) doesn't count toward limit
- [ ] Normal/late withdrawals count toward monthly limit (2 max)
- [ ] Warning shown when withdrawing > 24 hours after acceptance
- [ ] Customer receives immediate notification
- [ ] Task status changes back to OPEN
- [ ] Professional assignment cleared from task
- [ ] Application status marked as 'withdrawn'
- [ ] Withdrawal tracked in professional stats
- [ ] High withdrawal rate shown on profile
- [ ] Full i18n support (EN/BG/RU)

## Technical Implementation

### Database Changes

```sql
-- Add withdrawal tracking to applications
ALTER TABLE applications ADD COLUMN withdrawn_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN withdraw_reason VARCHAR(50);
ALTER TABLE applications ADD COLUMN withdraw_description TEXT;
ALTER TABLE applications ADD COLUMN withdraw_timing_impact VARCHAR(20); -- 'low', 'medium', 'high'

-- Track professional withdrawals
CREATE TABLE professional_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  timing_impact VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  hours_since_acceptance DECIMAL(10,2),
  withdrew_at TIMESTAMP DEFAULT NOW(),
  month_year VARCHAR(7) DEFAULT TO_CHAR(NOW(), 'YYYY-MM'), -- '2025-10'
  INDEX idx_professional_month (professional_id, month_year)
);

-- Add stats to professional profile
ALTER TABLE users ADD COLUMN total_withdrawals INT DEFAULT 0;
ALTER TABLE users ADD COLUMN withdrawals_this_month INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_withdrawal_reset DATE;
ALTER TABLE users ADD COLUMN withdrawal_rate DECIMAL(5,4); -- 0.0000 to 1.0000

-- Add cooloff tracking
CREATE TABLE professional_task_cooloffs (
  professional_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  can_reapply_at TIMESTAMP,
  PRIMARY KEY (professional_id, task_id)
);
```

### API Endpoints

```typescript
// 1. Get professional's withdrawal stats
GET /api/professionals/me/withdrawal-stats
Response: {
  withdrawalsThisMonth: number,
  maxPerMonth: number,
  totalWithdrawals: number,
  withdrawalRate: number,
  canWithdraw: boolean
}

// 2. Withdraw from task
POST /api/tasks/:taskId/withdraw
Body: {
  reason: string,
  description?: string
}
Response: {
  success: boolean,
  timingImpact: 'low' | 'medium' | 'high',
  remainingWithdrawals: number,
  affectsReputation: boolean
}

// 3. Check if can withdraw
GET /api/tasks/:taskId/can-withdraw
Response: {
  canWithdraw: boolean,
  reason?: string,
  timeSinceAcceptance: number,
  timingImpact: string
}

// 4. Check if can reapply after withdrawal
GET /api/tasks/:taskId/can-reapply
Response: {
  canReapply: boolean,
  reason?: string,
  cooloffEndsAt?: Date
}
```

### Withdrawal Handler

```typescript
// /src/lib/services/professional-withdrawal.ts
export async function withdrawFromTask(
  taskId: string,
  professionalId: string,
  reason: string,
  description?: string
) {
  // Get task and application
  const task = await getTask(taskId)
  const application = await getAcceptedApplication(taskId, professionalId)

  // Calculate timing impact
  const hoursSinceAcceptance =
    (Date.now() - application.acceptedAt.getTime()) / (1000 * 60 * 60)

  let timingImpact: 'low' | 'medium' | 'high'
  if (hoursSinceAcceptance < 2) timingImpact = 'low'
  else if (hoursSinceAcceptance < 24) timingImpact = 'medium'
  else timingImpact = 'high'

  // Update task
  await updateTask(taskId, {
    status: 'open',
    selectedProfessionalId: null,
    acceptedApplicationId: null
  })

  // Update application
  await updateApplication(application.id, {
    status: 'withdrawn',
    withdrawnAt: new Date(),
    withdrawReason: reason,
    withdrawDescription: description,
    withdrawTimingImpact: timingImpact
  })

  // Track withdrawal (if not early withdrawal)
  if (timingImpact !== 'low') {
    await trackWithdrawal({
      professionalId,
      taskId,
      applicationId: application.id,
      reason,
      description,
      timingImpact,
      hoursSinceAcceptance
    })

    // Increment counter
    await incrementProfessionalWithdrawals(professionalId)
  }

  // Set cooloff period
  if (timingImpact === 'high') {
    await setPermanentCooloff(professionalId, taskId)
  } else if (timingImpact === 'medium') {
    await setCooloff(professionalId, taskId, 48) // hours
  }

  // Notify customer
  await createNotification({
    userId: task.customerId,
    type: 'professional_withdrew',
    taskId,
    professionalId,
    data: {
      professionalName: application.professionalName,
      taskTitle: task.title,
      reason: translateReason(reason)
    }
  })

  // Send email
  await sendWithdrawalEmail(task.customerId, {
    taskTitle: task.title,
    professionalName: application.professionalName,
    taskUrl: `/tasks/${taskId}`
  })

  return {
    success: true,
    timingImpact,
    affectsReputation: timingImpact !== 'low'
  }
}
```

## Translation Keys

### English

```typescript
// In myWork.ts (new file or in applications.ts)
'myWork.withdrawFromTask': 'Withdraw from Task',
'myWork.cannotWithdraw': 'Cannot withdraw',

// In taskDetail.ts
'taskDetail.professional.withdraw': 'Withdraw from Task',

// In professionalWithdraw.ts (new file)
'professionalWithdraw.title': 'Withdraw from Task',
'professionalWithdraw.subtitle': 'Withdrawing from: {{taskTitle}}',
'professionalWithdraw.customer': 'Customer',
'professionalWithdraw.customerNotification': 'The customer will be notified immediately and the task will be reopened',

// Rate limiting
'professionalWithdraw.rateLimit.title': 'You can withdraw {{remaining}} more time(s) this month',
'professionalWithdraw.rateLimit.message': 'Professionals can withdraw from up to {{max}} tasks per month',
'professionalWithdraw.rateLimit.warning': 'Frequent withdrawals may affect your professional rating and account standing',
'professionalWithdraw.limitExceeded.title': 'Monthly withdrawal limit reached',
'professionalWithdraw.limitExceeded.message': 'You\'ve reached your withdrawal limit for this month. Please contact support if you have an emergency situation.',

// Timing warnings
'professionalWithdraw.earlyWithdrawal.title': 'Early withdrawal - no penalty',
'professionalWithdraw.earlyWithdrawal.message': 'Since you accepted less than 2 hours ago, this won\'t count toward your monthly limit',
'professionalWithdraw.lateWithdrawal.title': 'Late withdrawal notice',
'professionalWithdraw.lateWithdrawal.message': 'Withdrawing more than 24 hours after acceptance significantly impacts the customer and will affect your professional rating',

// Reasons
'professionalWithdraw.reasonLabel': 'Why are you withdrawing?',
'professionalWithdraw.reasons.health_emergency': 'Health issue or emergency',
'professionalWithdraw.reasons.capacity_issue': 'Overbooked or underestimated time required',
'professionalWithdraw.reasons.scope_mismatch': 'Task different than expected',
'professionalWithdraw.reasons.customer_unresponsive': 'Customer not responding to messages',
'professionalWithdraw.reasons.location_issue': 'Cannot reach location or safety concern',
'professionalWithdraw.reasons.budget_dispute': 'Customer wants to renegotiate agreed price',
'professionalWithdraw.reasons.equipment_issue': 'Don\'t have necessary tools or materials',
'professionalWithdraw.reasons.other': 'Other reason',

// Form
'professionalWithdraw.descriptionLabel': 'Additional details',
'professionalWithdraw.descriptionPlaceholder': 'Please explain your situation...',
'professionalWithdraw.descriptionHint': 'This helps us improve the platform',
'professionalWithdraw.confirmButton': 'Withdraw from Task',
'professionalWithdraw.reputationWarning': 'This withdrawal will be recorded and may affect your professional rating',

// Success/error
'professionalWithdraw.success': 'You\'ve withdrawn from the task. The customer has been notified.',
'professionalWithdraw.error': 'Unable to withdraw. Please try again or contact support.',
```

### Russian & Bulgarian
Similar translations in both languages.

## User Flow Examples

### Example 1: Emergency Withdrawal (Early)
1. Professional accepts plumbing task at 9:00 AM
2. At 10:00 AM, gets emergency call - family member hospitalized
3. Opens "My Work" page, clicks "Withdraw from Task"
4. Dialog shows: "Early withdrawal - no penalty" (blue banner)
5. Selects reason: "Health issue or emergency"
6. Adds description: "Family emergency, hospitalized"
7. Clicks "Withdraw from Task"
8. Task returns to OPEN
9. Customer immediately notified
10. Professional's withdrawal counter NOT incremented (early withdrawal)

### Example 2: Capacity Issue (Normal)
1. Professional accepts electrical work
2. Next day, realizes it's bigger job than expected
3. 18 hours after acceptance, decides to withdraw
4. Dialog shows: "You can withdraw 2 more time(s) this month" (yellow banner)
5. Selects reason: "Overbooked or underestimated time"
6. Adds description: "This requires full rewiring which I can't complete in timeframe"
7. Confirms withdrawal
8. Task reopened, customer notified
9. Withdrawal counter: 1/2 used
10. Can reapply after 48-hour cooloff if customer invites

### Example 3: Late Withdrawal (High Impact)
1. Professional accepted cleaning task 3 days ago
2. Customer has been waiting, turned down other applicants
3. Professional now wants to withdraw
4. Dialog shows: "Late withdrawal notice" (red banner)
5. Warning: "This will affect your professional rating"
6. Selects reason, confirms
7. Task reopened, customer notified
8. Withdrawal counter: 1/2 used
9. Reputation score decreased
10. CANNOT reapply to this task again

## Professional Profile Display

Show withdrawal stats on profile:
```typescript
// If withdrawal rate > 15%
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
  <div className="flex items-center gap-2">
    <AlertTriangle className="w-4 h-4 text-yellow-600" />
    <span className="text-sm text-yellow-900">
      {{withdrawnCount}} withdrawals from {{acceptedCount}} accepted tasks
    </span>
  </div>
</div>

// If withdrawal rate > 30%
<div className="bg-red-50 border border-red-200 rounded-lg p-3">
  <div className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4 text-red-600" />
    <span className="text-sm font-semibold text-red-900">
      High withdrawal rate: {{withdrawalRate}}%
    </span>
  </div>
  <p className="text-xs text-red-700 mt-1">
    This professional frequently withdraws from accepted tasks
  </p>
</div>
```

## Admin Dashboard

Track withdrawal patterns:
- Professionals with > 3 withdrawals this month
- Tasks with multiple withdrawals from different professionals
- Withdrawal reasons breakdown (identify systemic issues)
- Average time from acceptance to withdrawal
- Customers affected by multiple withdrawals

## Priority
**High** - Important for marketplace health and professional flexibility

## Dependencies
- My Work page (professional dashboard)
- Task detail page
- Notification system
- Email system
- Professional profile stats

## Related Features
- Cancel Task (customer side) - implemented
- My Work page - exists, needs withdraw button
- Professional reputation system
- Task lifecycle management

## Success Metrics
- % of withdrawals that are early (< 2 hours)
- Average time from acceptance to withdrawal
- Withdrawal rate per professional
- Customer satisfaction after withdrawal
- Re-application success rate after withdrawal

## Notes
- More lenient than customer cancellation (2 vs 1 per month)
- Early withdrawals don't count toward limit (grace period)
- Late withdrawals have stronger reputation impact
- Focus on legitimate use cases, not punishment
- Help professionals maintain good standing while giving escape route
