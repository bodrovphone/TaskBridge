# Fix Cron Job Notifications with Proper Localization

## Task Description
Weekly Digest and Deadline Reminder cron jobs are working but not using the localization system. They send hardcoded English messages to all users regardless of their preferred language.

## Current Issues

1. **Weekly Digest (`/api/cron/weekly-digest`)** - Manually builds English messages
   - Hardcoded: `"Hi ${firstName}! Here are ${tasks.length} new tasks..."`
   - Not using localized templates
   - No support for BG/RU languages

2. **Deadline Reminder (`/api/cron/deadline-reminders`)** - Hardcoded English strings
   - Hardcoded: `"Task Deadline Reminder ⏰"`
   - Hardcoded: `"${task.title} is due in ${hoursUntil} hours..."`
   - Not using localized templates

3. **Notification Types Not in Localization Utility**
   - `weeklyDigest` not in `getNotificationContent()` or `getTelegramMessage()`
   - `deadlineReminder` not in `getNotificationContent()` or `getTelegramMessage()`

## Requirements

### 1. Add Localization Support

**Update `/src/lib/utils/notification-i18n.ts`:**
- Add `weeklyDigest` and `deadlineReminder` to the type union in `getNotificationContent()`
- Add `weeklyDigest` and `deadlineReminder` to the type union in `getTelegramMessage()`

### 2. Create Translation Keys

**Add to all 3 languages (`/src/lib/intl/en/notifications.ts`, `/bg/`, `/ru/`):**

```typescript
// Weekly Digest
'notifications.content.weeklyDigest.title': 'Weekly Task Digest - {{count}} New Tasks',
'notifications.content.weeklyDigest.message': 'Hi {{firstName}}! Here are {{count}} new tasks in your categories this week.',

'notifications.telegram.weeklyDigest': '📬 <b>Weekly Task Digest</b>\n\nHi {{firstName}}! Here are <b>{{count}} new tasks</b> in your categories this week:\n\n{{taskList}}\n\n{{link}}',

// Deadline Reminder
'notifications.content.deadlineReminder.title': 'Task Deadline Reminder ⏰',
'notifications.content.deadlineReminder.message': '"{{taskTitle}}" is due in {{hours}} hours. Don\'t forget to complete and update the status.',

'notifications.telegram.deadlineReminder': '⏰ <b>Deadline Reminder</b>\n\n"<b>{{taskTitle}}</b>" is due in <b>{{hours}} hours</b>.\n\n⚠️ Don\'t forget to:\n• Complete the task\n• Update the status\n• Notify the customer\n\n{{link}}',
```

### 3. Update Cron Jobs to Use Localized Content

**Weekly Digest (`/src/app/api/cron/weekly-digest/route.ts`):**
- Get user's preferred language from database
- Build `taskList` string with category grouping (localized)
- Call `createNotification()` with `type: 'weekly_digest'` and proper `templateData`
- Remove manual message construction

**Deadline Reminder (`/src/app/api/cron/deadline-reminders/route.ts`):**
- Get user's preferred language from database
- Call `createNotification()` with `type: 'deadline_reminder'` and proper `templateData`
- Remove manual message construction

### 4. Update Notification Service

**Update `/src/lib/services/notification-service.ts`:**
- Update `localizedTypes` array to include `'weekly_digest'` and `'deadline_reminder'`
- Update `telegramTypes` array to include `'weekly_digest'` and `'deadline_reminder'`
- Update `typeMap` objects to map `'weekly_digest'` → `'weeklyDigest'` and `'deadline_reminder'` → `'deadlineReminder'`

### 5. User Preferences Schema

Ensure `notification_preferences` JSONB field supports:
```json
{
  "weeklyTaskDigest": {
    "inApp": true,
    "telegram": true
  },
  "deadlineReminder": {
    "inApp": true,
    "telegram": true
  }
}
```

## Acceptance Criteria

- [ ] `weeklyDigest` and `deadlineReminder` added to notification-i18n.ts type unions
- [ ] Translation keys added for both notification types (EN/BG/RU)
- [ ] Weekly digest cron uses localized content based on user's preferred language
- [ ] Deadline reminder cron uses localized content based on user's preferred language
- [ ] Bulgarian users receive notifications in Bulgarian
- [ ] Russian users receive notifications in Russian
- [ ] English users receive notifications in English
- [ ] Task list formatting works correctly in all languages (weekly digest)
- [ ] Hour formatting works correctly in all languages (deadline reminder)
- [ ] Telegram messages use proper HTML formatting with bold/emoji
- [ ] User preferences are respected (can opt-in/opt-out per notification type)
- [ ] Fallback to English if user's language is not set
- [ ] Cron jobs log user language for debugging

## Technical Notes

### Template Data Structure

**Weekly Digest:**
```typescript
templateData: {
  firstName: string,
  count: number,
  taskList: string,  // Pre-formatted with categories
  link: string
}
```

**Deadline Reminder:**
```typescript
templateData: {
  taskTitle: string,
  hours: number,
  link: string
}
```

### User Language Detection
```typescript
const userLocale = user.preferred_language?.toLowerCase() as 'en' | 'bg' | 'ru' || 'bg'
```

### Testing Checklist
1. Change user's `preferred_language` to `bg` in Supabase
2. Manually trigger weekly digest cron
3. Verify notification is in Bulgarian (both in-app and Telegram)
4. Repeat for Russian (`ru`) and English (`en`)
5. Test with users who have Telegram connected vs not connected
6. Test with different user preference combinations

## Priority
Medium - Cron jobs work but provide poor UX for non-English users

## Related Files
- `/src/lib/utils/notification-i18n.ts`
- `/src/lib/intl/en/notifications.ts`
- `/src/lib/intl/bg/notifications.ts`
- `/src/lib/intl/ru/notifications.ts`
- `/src/lib/services/notification-service.ts`
- `/src/app/api/cron/weekly-digest/route.ts`
- `/src/app/api/cron/deadline-reminders/route.ts`
