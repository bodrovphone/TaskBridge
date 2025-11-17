# Invite Professional to Task - Complete System

## Task Description
Implement a comprehensive "Invite Professional to Task" system that allows customers to invite professionals they discover in the professionals directory to their tasks. This is a reverse flow from the normal "professional applies to task" workflow - here the customer actively invites a professional.

## Use Case Flow
**Starting Point**: Customer browses professionals directory, finds someone with good reviews/credentials, and wants to suggest their task to them.

### Branch A: Customer Has No Tasks Yet (New Task Creation Flow)
1. Customer clicks "Suggest My Task" button on professional detail page
2. Customer is NOT authenticated → Show login form (Branch C)
3. Customer IS authenticated but has NO open tasks → Redirect to task creation form
4. Redirect includes query parameter: `?inviteProfessionalId={uuid}`
5. Task creation form shows prominent banner/notice:
   - "Creating this task to invite [Professional Name]"
   - "They will be notified immediately after you create this task"
6. Customer completes task creation
7. Success toast: "Task created! [Professional Name] has been invited and will be notified."
8. System sends notification to professional (Telegram + in-app)

### Branch B: Customer Has Existing Open Tasks (Task Selection Flow)
1. Customer clicks "Suggest My Task" button on professional detail page
2. Customer is NOT authenticated → Show login form (Branch C)
3. Customer IS authenticated AND has open tasks → Show task selection dropdown/modal
4. Customer picks an existing open task from the list
5. Confirmation: "Send invitation to [Professional Name] for task '[Task Title]'?"
6. Customer confirms
7. Success toast: "[Professional Name] has been invited and will be notified."
8. System sends notification to professional (Telegram + in-app)

### Branch C: Unauthenticated User Flow
1. Customer clicks "Suggest My Task" button
2. Show authentication slide-over/modal
3. After successful login → Resume flow (Branch A or B based on task status)

## Professional's Perspective
Professional receives a **task invitation notification** (new notification type):
- Notification shows: "You've been invited to apply for a task by [Customer Name]"
- Includes: Task title, category, budget range (if specified)
- Click notification → Navigate to task detail page
- Professional still needs to **apply** to the task (existing application flow)
- Invitation is just a notification - not an automatic application

## Database Schema Changes

### New Notification Type
Add to `notifications` table (existing schema):
```sql
type: 'task_invitation'
metadata: {
  taskId: string
  customerId: string
  customerName: string
  taskTitle: string
  taskCategory: string
}
action_url: '/tasks/{taskId}'
```

### Optional: Track Invitation Status
Consider adding `task_invitations` table for analytics:
```sql
CREATE TABLE task_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  UNIQUE(task_id, professional_id)
);
```

## Requirements

### UI Components
- [ ] Update "Invite to Apply" button → "Suggest My Task" button
- [ ] Add authentication check before showing task selection
- [ ] Create task selection dropdown/modal for Branch B
- [ ] Create banner/notice for task creation form (Branch A)
- [ ] Update notification center to display task invitations

### Backend/API
- [ ] Create API endpoint: POST `/api/tasks/{taskId}/invite-professional`
- [ ] Create API endpoint: POST `/api/professionals/{professionalId}/invite` (with task selection)
- [ ] Implement notification creation for task invitations
- [ ] Integrate with Telegram notification service
- [ ] Add RLS policies for task invitations (if using separate table)

### Notifications
- [ ] Define Telegram notification template for task invitations
- [ ] Create in-app notification rendering for task invitations
- [ ] Ensure notification links to correct task detail page
- [ ] Mark notification as read when professional views task

### Task Creation Form Enhancement
- [ ] Detect `inviteProfessionalId` query parameter
- [ ] Show banner: "You're inviting [Professional Name] to this task"
- [ ] Send invitation after successful task creation
- [ ] Show success toast with invitation confirmation

### Authentication Flow
- [ ] Show auth slide-over when unauthenticated user clicks "Suggest My Task"
- [ ] Preserve invite intent after authentication
- [ ] Redirect to appropriate flow (Branch A or B) after login

## Acceptance Criteria

### Branch A (No Existing Tasks)
- [ ] Unauthenticated customer sees login form when clicking "Suggest My Task"
- [ ] Authenticated customer with no tasks redirects to task creation form
- [ ] Task creation form shows clear banner about inviting the professional
- [ ] After task creation, professional receives notification (Telegram + in-app)
- [ ] Success toast confirms invitation was sent

### Branch B (Existing Tasks)
- [ ] Authenticated customer with open tasks sees task selection dropdown
- [ ] Customer can pick from list of their open tasks
- [ ] Confirmation dialog shows before sending invitation
- [ ] Professional receives notification with correct task details
- [ ] Success feedback confirms invitation was sent

### Professional Experience
- [ ] Professional receives notification: "You've been invited to apply..."
- [ ] Notification shows customer name, task title, category
- [ ] Clicking notification navigates to task detail page
- [ ] Professional can apply to task using existing application flow
- [ ] Notification is marked as read after viewing

### General
- [ ] No duplicate invitations (same professional + same task)
- [ ] Invitation only sent for "open" status tasks
- [ ] Customer cannot invite professionals to completed/cancelled tasks
- [ ] Notifications are properly localized (EN/BG/RU)

## Technical Notes

### Key Files to Modify
- `/src/features/professionals/components/sections/action-buttons-row.tsx` - Update button handler
- `/src/app/[lang]/create-task/page.tsx` - Add invitation banner logic
- `/src/lib/services/telegram-notification.ts` - Add task invitation template
- `/src/components/notification-center/` - Add invitation notification rendering
- `/src/app/api/tasks/[id]/invite-professional/route.ts` - New API endpoint
- `/src/app/api/professionals/[id]/invite/route.ts` - New API endpoint

### Notification Template (Telegram)
```typescript
taskInvitation: (customerName: string, taskTitle: string, taskCategory: string) =>
  `🎯 <b>New Task Invitation!</b>\n\n` +
  `<b>${customerName}</b> has invited you to apply for their task:\n\n` +
  `📋 <b>${taskTitle}</b>\n` +
  `🏷️ Category: ${taskCategory}\n\n` +
  `Click below to view the task details and apply.`
```

### Authentication Preservation
```typescript
// After login, check for invite intent
const searchParams = new URLSearchParams(window.location.search)
const inviteProfessionalId = searchParams.get('inviteProfessionalId')
const inviteTaskId = searchParams.get('inviteTaskId')

if (inviteProfessionalId) {
  // Check if user has open tasks → Branch B
  // Else → Branch A (redirect to create-task)
}
```

## Priority
High - This is a key customer engagement feature that enables proactive task matching

## Related Features
- Professional directory browsing (`/professionals`)
- Task creation form (`/create-task`)
- Notification system (Telegram + in-app)
- Authentication system (login/signup)
- Task application flow (existing)

## Analytics Considerations
- Track invitation conversion rate (invited → applied → hired)
- Measure customer satisfaction with invited professionals
- Monitor notification open rates for task invitations
- A/B test invitation messaging for better engagement
