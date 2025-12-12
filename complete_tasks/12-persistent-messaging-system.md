# REFIGN THIS! WE DON"T HAVE A MESSANGER in a CLASSICAL WAY

# Persistent Messaging System

## Task Description
Build a persistent messaging/inbox system separate from the ephemeral notification center. Users need a way to access important communications even after clearing notifications.

## Problem Statement
Currently, notifications are temporary alerts that can be cleared. Once cleared, there's no way to access:
- Task-related questions and answers
- Application discussions with clients
- Important communication history
- Message threads between users

## Requirements

### Core Features
- **Persistent Message Inbox**: Messages are never lost, even when notifications are cleared
- **Conversation Threads**: Group messages by task/application for context
- **Message Types**:
  - Task questions from professionals
  - Application discussions
  - General task-related communications
  - System messages
- **Search & Filter**: Find old messages by task, user, or content
- **Unread Badge**: Show unread message count
- **Integration**: Notifications link to persistent message threads

### User Interface
- **Location Options** (choose one or both):
  1. Profile page → Add "Messages" tab
  2. Dedicated `/messages` route in main navigation
- **Message List View**: Show all conversations with preview
- **Thread View**: Full conversation when clicking a message
- **Compose**: Ability to send new messages to task participants

### Data Structure
```typescript
interface Message {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  taskId?: string;
  applicationId?: string;
  subject?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: {
    taskTitle?: string;
    senderName?: string;
  };
}

interface MessageThread {
  id: string;
  participants: string[];
  taskId?: string;
  subject: string;
  lastMessage: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Technical Implementation
1. Create `/src/stores/message-store.ts` with Zustand
2. Create `/src/types/messages.ts` for TypeScript interfaces
3. Create `/src/components/messages/` folder with:
   - `message-thread-list.tsx` - List of conversations
   - `message-thread.tsx` - Single conversation view
   - `message-compose.tsx` - New message composer
   - `message-card.tsx` - Individual message display
4. Add route: `/app/[lang]/messages/page.tsx`
5. Add navigation item in header (if using dedicated route)
6. OR add Messages tab in Profile page

### Integration with Notifications
- Notification "message_received" → Links to `/messages/[threadId]`
- Notification shows preview → Full message in inbox
- Clicking notification marks message as read
- Bell icon for notifications, envelope/message icon for messages

## Acceptance Criteria
- [ ] User can view all message threads
- [ ] User can open and read full conversation
- [ ] User can compose new messages to task participants
- [ ] Messages persist even after notifications are cleared
- [ ] Unread message count displayed
- [ ] Search/filter functionality works
- [ ] Mobile responsive design
- [ ] i18n translations (EN, BG, RU)
- [ ] Integrates with existing notification system

## Technical Notes
- Consider pagination for message threads (load more)
- Real-time updates via WebSocket or polling (future enhancement)
- Message attachments (future enhancement)
- Push notifications for new messages (future enhancement)
- Email notifications for unread messages (future enhancement)

## Priority
**Medium** - Important for user communication but not blocking MVP launch

## Estimated Effort
**Medium-Large** (2-3 days)
- Day 1: Data structure, store, types, and message thread list
- Day 2: Thread view, compose functionality, routing
- Day 3: Integration with notifications, styling, mobile responsiveness, i18n

## Dependencies
- Notification system (completed)
- Profile page structure
- Task detail pages (for linking context)
