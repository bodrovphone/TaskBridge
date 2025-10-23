# Edit Pending Tasks with Smart Improvement Hints

## Task Description
Allow customers to edit their existing OPEN tasks that haven't received applications. Show intelligent hints after 7+ days without applications to help users improve their task posting and attract professionals.

## Current Status
- Tasks can be viewed on "My Posted Tasks" page
- No edit functionality exists yet
- No system to track task age or application count
- No hints/notifications for underperforming tasks

## User Scenario
**Problem**: User posts a task with:
- Budget too low (50 лв for full apartment cleaning)
- Missing important details (no square meters, no address)
- Vague description ("need cleaning")
- Wrong category selected

**Result**: 7+ days pass, zero applications

**Solution**: Show friendly banner on task card with actionable suggestions:
> "**No applications yet?** Your task has been open for 8 days. Consider:
> - Increasing budget (avg. for this category: 120 лв)
> - Adding more details about location
> - Clarifying requirements in description"

## Requirements

### 1. Edit Task Button
Add "Edit Task" button to OPEN task cards:
```typescript
// Only show for OPEN status tasks
{status === 'open' && (
  <Button
    size="sm"
    variant="bordered"
    color="primary"
    startContent={<Edit className="w-4 h-4" />}
    onPress={() => router.push(`/${lang}/tasks/${id}/edit`)}
  >
    {t('postedTasks.editTask')}
  </Button>
)}
```

### 2. Edit Task Page
**Route**: `/app/[lang]/tasks/[id]/edit/page.tsx`

**Features**:
- Reuse Create Task form component
- Pre-fill with current task data
- Show "Editing: [Task Title]" banner
- "Save Changes" instead of "Post Task"
- Option to "Cancel" (returns to task detail)
- Validation same as create task

### 3. Smart Hint System

#### Trigger Conditions
Show improvement hints when:
- Task status = 'open'
- Task age >= 7 days
- Applications count = 0
- User hasn't dismissed hint in last 24 hours

#### Hint Banner Location
Display on task card in "My Posted Tasks" page:
```typescript
{shouldShowHint && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
    <div className="flex items-start gap-3">
      <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-yellow-900 mb-2">
          {t('taskHints.noApplications.title', { days: taskAge })}
        </p>
        <ul className="text-xs text-yellow-800 space-y-1 mb-3">
          {hints.map(hint => (
            <li key={hint.type}>• {hint.message}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button
            size="sm"
            color="warning"
            variant="flat"
            startContent={<Edit className="w-3 h-3" />}
            onPress={() => router.push(`/${lang}/tasks/${id}/edit`)}
          >
            {t('taskHints.improveTask')}
          </Button>
          <Button
            size="sm"
            variant="light"
            onPress={() => dismissHint(id)}
          >
            {t('taskHints.dismiss')}
          </Button>
        </div>
      </div>
      <button
        onClick={() => dismissHint(id)}
        className="text-yellow-600 hover:text-yellow-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
```

### 4. Intelligent Hint Generation

Analyze task data and suggest improvements:

#### Budget Analysis
```typescript
// Compare to category average
const categoryAvg = getCategoryAverageBudget(task.category)
if (task.budget < categoryAvg * 0.7) {
  hints.push({
    type: 'budget_low',
    message: t('taskHints.suggestions.budgetLow', {
      current: task.budget,
      average: categoryAvg
    })
  })
}
```

#### Description Quality
```typescript
// Check description length and detail
if (task.description.length < 50) {
  hints.push({
    type: 'description_short',
    message: t('taskHints.suggestions.descriptionShort')
  })
}

// Check for missing key info
const hasLocation = task.location?.neighborhood && task.location?.city
if (!hasLocation) {
  hints.push({
    type: 'location_missing',
    message: t('taskHints.suggestions.locationMissing')
  })
}
```

#### Timeline/Urgency
```typescript
// Check if deadline is too tight
if (task.urgency === 'same_day' && taskAge > 1) {
  hints.push({
    type: 'urgency_unrealistic',
    message: t('taskHints.suggestions.urgencyUnrealistic')
  })
}
```

#### Category Appropriateness
```typescript
// Check if task is in wrong category (ML/heuristics)
const suggestedCategory = analyzeCategoryMatch(task)
if (suggestedCategory !== task.category) {
  hints.push({
    type: 'category_mismatch',
    message: t('taskHints.suggestions.categoryMismatch', {
      suggested: t(suggestedCategory)
    })
  })
}
```

### 5. Hint Dismissal System
```typescript
// Store dismissed hints to avoid spam
interface DismissedHint {
  taskId: string
  userId: string
  dismissedAt: Date
  expiresAt: Date // 24 hours from dismissal
}

// Check if hint should show
const shouldShowHint = (taskId: string) => {
  const dismissed = getDismissedHint(taskId, userId)
  if (!dismissed) return true
  return new Date() > dismissed.expiresAt
}
```

### 6. Hint Priority Levels

**High Priority** (show first, red icon):
- Budget < 50% of category average
- Missing location entirely
- Description < 20 characters

**Medium Priority** (yellow icon):
- Budget < 70% of category average
- Description < 50 characters
- No images uploaded

**Low Priority** (blue icon):
- Consider adding more photos
- Make title more descriptive
- Add timeline flexibility

## Acceptance Criteria
- [ ] "Edit Task" button appears on OPEN task cards
- [ ] Edit page pre-fills all current task data
- [ ] User can modify any field
- [ ] Save changes updates task without creating new one
- [ ] Hint banner shows after 7+ days with no applications
- [ ] Hints are specific and actionable (not generic)
- [ ] At least 3 hint types implemented (budget, description, location)
- [ ] User can dismiss hints (reappear after 24 hours)
- [ ] X button and "Dismiss" button both work
- [ ] "Improve Task" button navigates to edit page
- [ ] Hints don't show if user recently dismissed them
- [ ] Hints don't show if task has applications
- [ ] Full i18n support (EN/BG/RU)

## Technical Implementation

### Database Changes
```sql
-- Track hint dismissals
CREATE TABLE task_hint_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(task_id, user_id)
);

-- Add index for efficient lookup
CREATE INDEX idx_hint_dismissals_active
ON task_hint_dismissals(task_id, user_id, expires_at)
WHERE expires_at > NOW();

-- Track task age and application metrics
ALTER TABLE tasks ADD COLUMN last_hint_shown_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN hint_dismiss_count INT DEFAULT 0;
```

### API Endpoints
```typescript
// 1. Edit task
PUT /api/tasks/:id
Body: { title, description, budget, category, ... }
Response: { success: boolean, task: Task }

// 2. Get task improvement hints
GET /api/tasks/:id/hints
Response: {
  shouldShow: boolean,
  hints: Array<{
    type: string,
    priority: 'high' | 'medium' | 'low',
    message: string,
    action?: string
  }>,
  taskAge: number,
  applicationsCount: number
}

// 3. Dismiss hint
POST /api/tasks/:id/hints/dismiss
Response: { success: boolean, expiresAt: Date }

// 4. Get category statistics
GET /api/categories/:slug/stats
Response: {
  averageBudget: number,
  medianBudget: number,
  averageDescriptionLength: number,
  successfulTasksCount: number
}
```

### Hint Generation Service
```typescript
// /src/lib/services/task-hints.ts
export interface TaskHint {
  type: string
  priority: 'high' | 'medium' | 'low'
  message: string
  action?: string
}

export function generateTaskHints(task: Task): TaskHint[] {
  const hints: TaskHint[] = []

  // Budget analysis
  const budgetHints = analyzeBudget(task)
  hints.push(...budgetHints)

  // Description quality
  const descriptionHints = analyzeDescription(task)
  hints.push(...descriptionHints)

  // Location completeness
  const locationHints = analyzeLocation(task)
  hints.push(...locationHints)

  // Category match
  const categoryHints = analyzeCategory(task)
  hints.push(...categoryHints)

  // Timeline realism
  const timelineHints = analyzeTimeline(task)
  hints.push(...timelineHints)

  // Sort by priority
  return hints.sort((a, b) =>
    priorityWeight[a.priority] - priorityWeight[b.priority]
  )
}

function analyzeBudget(task: Task): TaskHint[] {
  const categoryStats = getCategoryStats(task.category)
  const ratio = task.budget / categoryStats.averageBudget

  if (ratio < 0.5) {
    return [{
      type: 'budget_very_low',
      priority: 'high',
      message: `Budget is much lower than average (${categoryStats.averageBudget} лв)`,
      action: 'increase_budget'
    }]
  }

  if (ratio < 0.7) {
    return [{
      type: 'budget_low',
      priority: 'medium',
      message: `Consider increasing budget (avg: ${categoryStats.averageBudget} лв)`,
      action: 'increase_budget'
    }]
  }

  return []
}
```

### React Hook for Hints
```typescript
// /src/hooks/use-task-hints.ts
export function useTaskHints(taskId: string) {
  const [hints, setHints] = useState<TaskHint[]>([])
  const [shouldShow, setShouldShow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHints()
  }, [taskId])

  const fetchHints = async () => {
    const response = await fetch(`/api/tasks/${taskId}/hints`)
    const data = await response.json()
    setHints(data.hints)
    setShouldShow(data.shouldShow)
    setLoading(false)
  }

  const dismiss = async () => {
    await fetch(`/api/tasks/${taskId}/hints/dismiss`, {
      method: 'POST'
    })
    setShouldShow(false)
  }

  return { hints, shouldShow, loading, dismiss }
}
```

## Translation Keys

### English
```typescript
// In notifications.ts or new taskHints.ts
'taskHints.noApplications.title': 'No applications yet? Your task has been open for {{days}} days',
'taskHints.improveTask': 'Improve Task',
'taskHints.dismiss': 'Dismiss',
'taskHints.suggestions.budgetLow': 'Budget might be too low (avg. for this category: {{average}} лв)',
'taskHints.suggestions.budgetVeryLow': 'Budget is significantly below average ({{current}} лв vs {{average}} лв avg.)',
'taskHints.suggestions.descriptionShort': 'Add more details to your description',
'taskHints.suggestions.locationMissing': 'Specify your exact location (city and neighborhood)',
'taskHints.suggestions.urgencyUnrealistic': 'Consider making the deadline more flexible',
'taskHints.suggestions.categoryMismatch': 'This might fit better in "{{suggested}}" category',
'taskHints.suggestions.addPhotos': 'Upload photos to attract more professionals',
'taskHints.suggestions.improveTitleTitle': 'Make your title more specific and descriptive',

'postedTasks.editTask': 'Edit Task',
'editTask.title': 'Edit Task',
'editTask.savingChanges': 'Saving changes...',
'editTask.saveChanges': 'Save Changes',
'editTask.cancelEdit': 'Cancel',
'editTask.successMessage': 'Task updated successfully!',
'editTask.editingBanner': 'Editing: {{title}}',
```

### Russian & Bulgarian
Similar translations in both languages.

## Design Considerations

### When NOT to Show Hints
- Task has 1+ applications (success!)
- Task age < 7 days (give it time)
- User dismissed hint < 24 hours ago
- Task status != 'open'
- User edited task < 2 days ago (give edits time to work)

### Friendly Tone
Avoid:
- ❌ "Your task is bad"
- ❌ "You're stupid"
- ❌ "This will never work"

Use:
- ✅ "Consider improving..."
- ✅ "Professionals in this category usually..."
- ✅ "Here are some suggestions..."
- ✅ "Tasks with X tend to get more applications"

### Hint Limits
- Max 3 hints shown at once (show highest priority)
- If more than 3, show "View all suggestions" link
- Don't overwhelm user with criticism

## Analytics Tracking

Track hint effectiveness:
```typescript
// Events to track
- hint_shown (taskId, hintTypes, taskAge)
- hint_dismissed (taskId, hintTypes)
- hint_action_taken (taskId, hintType, action)
- task_edited_from_hint (taskId, fieldsChanged)
- task_applications_after_edit (taskId, applicationCount, daysAfterEdit)
```

## Future Enhancements
1. **ML-based hints**: Predict which changes will increase applications
2. **A/B test suggestions**: Test different hint phrasing
3. **Success stories**: "Users who increased budget by X got Y more applications"
4. **Hint preview**: Before posting, show potential issues
5. **Gamification**: "Task health score" (0-100)
6. **Professional feedback**: Let professionals suggest improvements
7. **Seasonal hints**: "Winter cleaning usually costs more"

## Priority
**High** - Directly impacts marketplace liquidity and user success rate

## Dependencies
- Edit Task page (can reuse Create Task form)
- Category statistics API
- Task age calculation
- Hint dismissal storage

## Related Features
- Create Task page (form reuse)
- My Posted Tasks page (hint display)
- Task analytics (hint effectiveness)
- Professional profiles (to get category averages)

## Success Metrics
- % of tasks edited after hint shown
- Increase in applications after edit
- Average time from hint to edit
- User satisfaction with hints (survey)
- Reduction in tasks with 0 applications

## Notes
- Start with 3-5 basic hints, add more based on data
- Be respectful and encouraging, never condescending
- Make hints dismissible to avoid annoyance
- Track which hints lead to successful edits
- Consider showing hints earlier (5 days?) if category is high-demand
