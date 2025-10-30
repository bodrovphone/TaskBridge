# Task 15: Budget "Unclear/Unset" Option

## Task Description
Add a new budget option for customers who don't know how much the work should cost. Currently, users can select fixed budget, hourly rate, or negotiable. We need to add an "unclear/unset" option for when the customer has no idea about pricing.

## Problem
The "I am not sure about the budget" button on task creation suggests that customers might not know pricing at all. They need a way to indicate this explicitly rather than being forced to choose between fixed/hourly/negotiable.

## Requirements

### Database Schema Changes
- Add new enum value to `budget_type` field: `unclear` or `unset`
- Set `unclear` as the default value for new tasks
- Ensure backward compatibility with existing tasks

### UI Changes
- Update create-task form to show "unclear/unset" option
- Display appropriate UI text: "I'm not sure about the budget" or "Budget unclear"
- Update task card display to show "Budget unclear" when this option is selected
- Update task detail page to handle this budget type

### Translation Keys
Add keys for all three languages (EN/BG/RU):
- `createTask.budgetType.unclear` - "Budget unclear"
- `taskCard.budget.unclear` - "Budget unclear"
- `taskDetail.budgetType.unclear` - "Budget unclear"

## Acceptance Criteria
- [ ] Database enum updated with `unclear` or `unset` option
- [ ] Default budget_type is set to `unclear`
- [ ] Create task form shows "unclear" option
- [ ] Task cards display "Budget unclear" correctly
- [ ] Task detail page handles unclear budget
- [ ] All translations added (EN/BG/RU)
- [ ] Existing tasks with other budget types still work correctly
- [ ] No breaking changes to existing functionality

## Technical Notes

**Database Migration:**
```sql
-- Add new enum value to budget_type
ALTER TYPE budget_type ADD VALUE IF NOT EXISTS 'unclear';

-- Update default for new tasks
ALTER TABLE tasks ALTER COLUMN budget_type SET DEFAULT 'unclear';
```

**Files to Update:**
- `/src/database/schema.ts` - Update budget_type enum
- `/src/app/[lang]/create-task/page.tsx` - Add unclear option to form
- `/src/components/ui/task-card.tsx` - Handle unclear in formatBudget()
- `/src/app/[lang]/tasks/[id]/components/task-detail-content.tsx` - Handle unclear in formatBudget()
- `/src/lib/intl/en/tasks.ts` - Add translation keys
- `/src/lib/intl/bg/tasks.ts` - Add translation keys
- `/src/lib/intl/ru/tasks.ts` - Add translation keys

**UI Flow:**
1. Customer creates task
2. Budget section shows 4 options: Fixed | Hourly | Negotiable | **Unclear** (default)
3. If "Unclear" selected, no budget inputs are required
4. Task displays "Budget unclear" on cards and detail pages
5. Professionals can still apply and propose their own budget

## Priority
Medium - Improves UX for customers unfamiliar with service pricing

## Related Issues
- Addresses user feedback from task creation flow
- Makes platform more accessible to first-time customers
