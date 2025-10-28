# Invite to Apply - Notification System

## Task Description
Implement a notification system that alerts professionals when a customer invites them to apply for a specific task. This feature is triggered from the professional's detail page when a customer clicks the "Invite to Apply" button.

## Requirements
- Create notification data structure for "invite to apply" events
- Store customer ID, professional ID, and task ID in notification
- Send notification to professional when customer invites them
- Professional can see notification in their dashboard/notification center
- Notification should link to the specific task
- Mark notification as read once professional views it

## Acceptance Criteria
- [ ] Notification is created when customer clicks "Invite to Apply" button
- [ ] Professional receives notification with task details
- [ ] Notification includes: customer name, task title, task category
- [ ] Clicking notification navigates professional to task detail page
- [ ] Professional can see all pending invitations in one place
- [ ] Notification is marked as read after viewing
- [ ] Customer can see if invitation was viewed (optional)

## Technical Notes
- Location: `/features/professionals/components/sections/action-buttons-row.tsx` (button click handler)
- Will need to create notification schema/API
- Consider using existing notification system if available
- Should show badge count on notification icon in header
- May need to create `/notifications` page or notification center component
- Consider implementing notification preferences (email, in-app, etc.)

## Priority
Medium

## Related Files
- `/src/features/professionals/components/sections/action-buttons-row.tsx` - Button component
- `/src/features/professionals/components/professional-detail-page.tsx` - Usage location
- `/src/components/common/header.tsx` - Notification bell icon location
