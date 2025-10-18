# My Tasks - Customer Dashboard

## Task Description
Build a comprehensive "My Tasks" dashboard page for customers to view and manage all tasks they have posted. This is the customer-side counterpart to the Professional Applications Dashboard.

## Requirements
- Display all tasks posted by the customer
- Filter by task status (open, in_progress, completed, cancelled)
- Sort by date, budget, applications count
- Show task cards with key information
- View detailed task information
- Manage applications received for each task
- Edit task details (if no applications yet)
- Cancel/close tasks
- View task activity and messages

## Acceptance Criteria
- [ ] Create `/app/[lang]/my-tasks/page.tsx` route
- [ ] Build `MyTasksList` component with filtering and sorting
- [ ] Build `MyTaskCard` component showing:
  - Task title, description, budget
  - Status badge
  - Applications count
  - Posted date
  - Location
  - Quick action buttons
- [ ] Build `TaskDetailModal` showing:
  - Full task details
  - Applications list (link to applications page or inline view)
  - Task activity timeline
  - Edit/Cancel options
- [ ] Create mock data with 10-15 tasks across different statuses
- [ ] Add English translations (EN)
- [ ] Add Bulgarian translations (BG)
- [ ] Add Russian translations (RU)
- [ ] Add navigation link in:
  - User avatar dropdown menu
  - Customer profile tab (prominent button - ✅ DONE)

## Technical Notes
- Follow same pattern as Professional Applications Dashboard
- Use `/src/features/tasks/` or create `/src/features/my-tasks/` for feature organization
- Reuse existing task components where possible
- Include status-specific actions (e.g., can't edit if has applications)
- Link to applications management for each task

## Status-Specific Features
**Open Tasks:**
- Edit task details
- View/manage applications
- Close/cancel task
- Bump/refresh task

**In Progress Tasks:**
- View accepted professional
- Message professional
- Mark as completed
- Report issue

**Completed Tasks:**
- Leave review for professional
- View final details
- Download receipt/invoice

**Cancelled Tasks:**
- View reason for cancellation
- Archive task

## Priority
High

## Estimated Time
6-8 hours
