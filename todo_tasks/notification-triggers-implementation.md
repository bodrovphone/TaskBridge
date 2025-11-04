# Notification Triggers Implementation

## Task Description
Implement automated notification triggers throughout the application to send real-time updates via Telegram (with fallback to email/SMS/Viber based on user preferences). This includes instant notifications for critical events and periodic digest notifications for task discovery.

## Problem
Users need to be informed about important events in the platform:
- Professionals miss new tasks matching their skills
- Customers don't know when someone applies to their task
- Professionals don't know when their applications are accepted/rejected
- Users miss important messages and updates

## Requirements

### Core Notification Triggers

#### 1. Professional Task Discovery (Weekly Digest)
**When:** Once per week (e.g., every Monday at 9:00 AM)
**Who:** Professionals who set preferred categories in their profile
**Trigger:** Scheduled cron job or background task
**Content:**
- List of new tasks posted in the last 7 days matching their preferred categories
- Location-based filtering (same city/region)
- Task count, budget range, and urgency indicators
- Direct links to browse filtered tasks

**Example message:**
```
📬 Weekly Task Digest

Hi Ivan! Here are 12 new tasks in your categories this week:

🔧 Plumbing (4 tasks)
• Emergency pipe repair - Sofia - 150 BGN
• Bathroom renovation - Sofia - 800 BGN
• +2 more

⚡ Electrical (3 tasks)
• Home rewiring - Plovdiv - 600 BGN
• +2 more

🏠 Home Repair (5 tasks)
...

👉 Browse all matching tasks
```

**Technical notes:**
- Store `last_digest_sent_at` in users table
- Query tasks created in last 7 days matching `professional_categories` from user profile
- Batch send to avoid rate limits (though Telegram has none)
- Allow users to opt-out or change frequency (Settings page)

---

#### 2. Customer: New Application Received (Instant)
**When:** Professional submits application to customer's task
**Who:** Task creator (customer)
**Trigger:** After successful application creation in database
**Content:**
- Professional's name and rating
- Proposed price and timeline
- Brief application message preview
- Link to view full application and profile

**Example message:**
```
✅ New Application!

Ivan Petrov has applied to your task:
"Fix leaking bathroom pipe"

💰 Proposed Price: 120 BGN
⏱️ Can start: Tomorrow
⭐ Rating: 4.8/5 (156 reviews)

"I have 10 years of experience with pipe repairs..."

👉 View full application
```

**Integration point:**
- ✅ `/api/applications` POST endpoint - **IMPLEMENTED**
- After application inserted into `applications` table
- **TODO**: Add notification call after successful application creation

---

#### 3. Professional: Application Accepted (Instant)
**When:** Customer accepts professional's application
**Who:** Professional whose application was accepted
**Trigger:** Application status changed to 'accepted'
**Content:**
- Task title and details
- Customer contact information
- Next steps (start work, message customer)
- Task deadline

**Example message:**
```
🎉 Application Accepted!

Your application for "Fix leaking bathroom pipe" has been accepted!

📍 Location: Sofia, Center
👤 Customer: Maria Ivanova
📞 Contact: +359 888 123 456

Next steps:
1. Contact the customer to confirm details
2. Start work by: Tomorrow, 10:00
3. Update task status when complete

👉 View task details
```

**Integration point:**
- ✅ `/api/applications/[id]/accept` endpoint - **IMPLEMENTED**
- After updating application status to 'accepted'
- **TODO**: Add notification call after successful acceptance

---

#### 4. Professional: Application Rejected (Instant - Optional)
**When:** Customer rejects professional's application
**Who:** Professional whose application was rejected
**Trigger:** Application status changed to 'rejected'
**Content:**
- Brief notification (not discouraging)
- Encouragement to apply to other tasks
- Link to browse more tasks

**Example message:**
```
📋 Application Update

Your application for "Fix leaking bathroom pipe" was not selected this time.

Don't worry! There are many other opportunities:
• 47 new tasks in your categories this week
• 12 urgent tasks near you

👉 Browse available tasks
```

**Integration point:**
- ✅ `/api/applications/[id]/reject` endpoint - **IMPLEMENTED**
- After updating application status to 'rejected'
- **TODO**: Add notification call after successful rejection (optional - consider professional's feelings)

---

### Additional High-Value Triggers

#### 5. New Message Received (Instant)
**When:** User receives a message in task chat
**Who:** Message recipient (customer or professional)
**Trigger:** New message inserted in `messages` table
**Content:**
- Sender name
- Task title
- Message preview (first 100 characters)
- Link to view full conversation

**Example message:**
```
💬 New Message

Maria Ivanova sent you a message about "Fix leaking bathroom pipe"

"Hi Ivan, can you come on Tuesday instead of..."

👉 View conversation
```

---

#### 6. Task Status Changed (Instant)
**When:** Task status changes (in_progress → completed, etc.)
**Who:** Both customer and professional
**Trigger:** Task status update in `tasks` table
**Content:**
- Task title
- New status
- Next action required

**Example message (to customer):**
```
✅ Task Completed

"Fix leaking bathroom pipe" has been marked as complete by Ivan Petrov.

Please review the work:
1. Confirm completion
2. Rate the professional
3. Process payment

👉 Review and complete
```

**Example message (to professional):**
```
⏳ Waiting for Customer Review

The customer will review your work on "Fix leaking bathroom pipe"

You'll receive payment once they confirm completion.
```

---

#### 7. Payment Received (Instant)
**When:** Payment is processed and confirmed
**Who:** Professional receiving payment
**Trigger:** Payment status changed to 'completed'
**Content:**
- Amount received
- Task title
- Net amount after fees
- Payment method/timeline

**Example message:**
```
💰 Payment Received!

You received 120 BGN for completing "Fix leaking bathroom pipe"

Net amount: 108 BGN (after 10% platform fee)
Payment method: Bank transfer
Arrives in: 2-3 business days

👉 View transaction details
```

---

#### 8. Review Received (Instant)
**When:** Customer leaves a review for professional
**Who:** Professional who received review
**Trigger:** Review inserted in `reviews` table
**Content:**
- Rating (stars)
- Review text
- Task title
- Option to respond

**Example message:**
```
⭐ New Review Received!

Maria Ivanova rated you 5/5 for "Fix leaking bathroom pipe"

"Ivan was professional, fast, and did excellent work. Highly recommend!"

Your new rating: 4.8/5 (157 reviews)

👉 Respond to review
```

---

#### 9. Task Deadline Reminder (Scheduled)
**When:** 24 hours before task deadline
**Who:** Professional with accepted application
**Trigger:** Scheduled check of task deadlines
**Content:**
- Task title
- Deadline time
- Reminder to update status

**Example message:**
```
⏰ Deadline Reminder

"Fix leaking bathroom pipe" is due tomorrow at 18:00

Don't forget to:
• Complete the work on time
• Update task status
• Request review from customer

👉 View task
```

---

#### 10. Inactive Account Re-engagement (Scheduled)
**When:** User hasn't logged in for 30 days
**Who:** All users
**Trigger:** Weekly check of last_login_at
**Content:**
- Personalized greeting
- Platform updates/new features
- Task count or opportunity highlights
- Incentive to return

**Example message:**
```
👋 We miss you, Ivan!

You haven't visited Trudify in a while. Here's what's new:

• 284 new tasks posted in your categories
• New instant Telegram notifications
• Improved professional matching

👉 Browse tasks now
```

---

## Acceptance Criteria

### Infrastructure
- [x] Telegram notification service implemented (`/lib/services/telegram-notification.ts`)
- [x] Notification templates created for common scenarios
- [x] `notification_logs` table tracks all notifications
- [ ] User notification preferences stored in database
- [ ] Notification settings page for users to customize preferences

### Core Triggers (Must Have - Phase 1)
- [ ] Professional weekly task digest (scheduled cron job)
- [ ] Customer: New application received (instant)
- [ ] Professional: Application accepted (instant)

### Additional Triggers (Nice to Have - Phase 2)
- [ ] Professional: Application rejected (instant, optional)
- [ ] New message received (instant)
- [ ] Task status changed (instant)
- [ ] Payment received (instant)
- [ ] Review received (instant)

### Advanced Triggers (Future - Phase 3)
- [ ] Task deadline reminder (24h before)
- [ ] Inactive account re-engagement (weekly)
- [ ] Custom notification rules per user (advanced settings)

### Settings & Preferences
- [ ] User can enable/disable each notification type
- [ ] User can choose notification channel (Telegram/Email/SMS)
- [ ] User can set digest frequency (daily/weekly/never)
- [ ] User can snooze notifications temporarily
- [ ] Unsubscribe link in all notifications

### Testing
- [ ] All notification templates render correctly
- [ ] Notifications send successfully via Telegram
- [ ] Fallback to email if Telegram delivery fails
- [ ] Rate limiting and retry logic implemented
- [ ] Notification logs accurately track delivery status

## Technical Notes

### Database Schema Additions

```sql
-- Add notification preferences to users table
ALTER TABLE users
ADD COLUMN notification_preferences JSONB DEFAULT '{
  "applicationReceived": true,
  "applicationAccepted": true,
  "applicationRejected": false,
  "messageReceived": true,
  "taskStatusChanged": true,
  "paymentReceived": true,
  "reviewReceived": true,
  "weeklyTaskDigest": true,
  "digestFrequency": "weekly"
}'::jsonb,
ADD COLUMN last_digest_sent_at TIMESTAMPTZ;

-- Create index for faster preference queries
CREATE INDEX idx_users_notification_prefs ON users USING GIN (notification_preferences);
CREATE INDEX idx_users_last_digest ON users(last_digest_sent_at);

-- Add notification schedule table for managing recurring notifications
CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  next_send_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_schedules_next_send ON notification_schedules(next_send_at)
WHERE is_active = true;
```

### Implementation Architecture

**1. Application-level triggers (Immediate):**
```typescript
// In /api/applications/route.ts (POST)
// After creating application:
await sendTemplatedNotification(
  task.customer_id,
  'applicationReceived',
  task.title,
  professional.full_name
);

// In /api/applications/[id]/accept/route.ts
// After accepting application:
await sendTemplatedNotification(
  application.professional_id,
  'applicationAccepted',
  task.title
);
```

**2. Database triggers (Real-time):**
```sql
-- Supabase Function: Notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function or webhook to send notification
  PERFORM pg_notify('new_message', json_build_object(
    'recipient_id', NEW.recipient_id,
    'sender_name', (SELECT full_name FROM users WHERE id = NEW.sender_id),
    'task_id', NEW.task_id,
    'message_preview', LEFT(NEW.content, 100)
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION notify_new_message();
```

**3. Scheduled notifications (Cron):**

Option A: Vercel Cron Jobs
```typescript
// /api/cron/weekly-digest/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get professionals who need digest
  const professionals = await supabase
    .from('users')
    .select('*')
    .eq('role', 'professional')
    .is('professional_categories', 'not', null)
    .or('last_digest_sent_at.is.null,last_digest_sent_at.lt.' + sevenDaysAgo);

  for (const professional of professionals) {
    await sendWeeklyTaskDigest(professional);
  }

  return Response.json({ success: true, sent: professionals.length });
}
```

**vercel.json:**
```json
{
  "crons": [{
    "path": "/api/cron/weekly-digest",
    "schedule": "0 9 * * 1"
  }]
}
```

Option B: Supabase Edge Functions with pg_cron
```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly digest
SELECT cron.schedule(
  'weekly-task-digest',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://your-edge-function.supabase.co/weekly-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);
```

### Notification Service Extensions

Add new methods to `/lib/services/telegram-notification.ts`:

```typescript
/**
 * Send weekly task digest to professional
 */
export async function sendWeeklyTaskDigest(userId: string): Promise<SendNotificationResult> {
  const supabase = await createClient();

  // Get user preferences and categories
  const { data: user } = await supabase
    .from('users')
    .select('professional_categories, city, telegram_id, full_name')
    .eq('id', userId)
    .single();

  if (!user?.professional_categories) {
    return { success: false, error: 'No preferred categories' };
  }

  // Get matching tasks from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .in('category', user.professional_categories)
    .eq('city', user.city)
    .eq('status', 'open')
    .gte('created_at', sevenDaysAgo.toISOString());

  if (!tasks || tasks.length === 0) {
    return { success: false, error: 'No new tasks' };
  }

  // Group by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {});

  // Build message
  let message = `📬 <b>Weekly Task Digest</b>\n\n`;
  message += `Hi ${user.full_name.split(' ')[0]}! Here are ${tasks.length} new tasks in your categories this week:\n\n`;

  for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
    message += `<b>${category}</b> (${categoryTasks.length} tasks)\n`;
    const topTasks = categoryTasks.slice(0, 3);
    for (const task of topTasks) {
      message += `• ${task.title} - ${task.city} - ${task.budget} BGN\n`;
    }
    if (categoryTasks.length > 3) {
      message += `• +${categoryTasks.length - 3} more\n`;
    }
    message += `\n`;
  }

  message += `👉 <a href="https://trudify.bg/browse-tasks">Browse all matching tasks</a>`;

  // Send notification
  const result = await sendTelegramNotification({
    userId,
    message,
    notificationType: 'weekly_digest',
    parseMode: 'HTML',
  });

  // Update last_digest_sent_at
  if (result.success) {
    await supabase
      .from('users')
      .update({ last_digest_sent_at: new Date().toISOString() })
      .eq('id', userId);
  }

  return result;
}

/**
 * Check if user wants to receive this notification type
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from('users')
    .select('notification_preferences, preferred_notification_channel')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // Check if notification type is enabled
  const prefs = user.notification_preferences || {};
  if (prefs[notificationType] === false) return false;

  // Check if user has Telegram configured
  if (user.preferred_notification_channel === 'telegram') {
    const { data: userWithTelegram } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('id', userId)
      .single();

    return !!userWithTelegram?.telegram_id;
  }

  return true;
}
```

### Notification Settings UI

Create `/app/[lang]/settings/notifications/page.tsx`:

```typescript
export default function NotificationSettings() {
  const preferences = {
    applicationReceived: true,
    applicationAccepted: true,
    applicationRejected: false,
    messageReceived: true,
    taskStatusChanged: true,
    paymentReceived: true,
    reviewReceived: true,
    weeklyTaskDigest: true,
    digestFrequency: 'weekly'
  };

  return (
    <div>
      <h1>Notification Settings</h1>

      <section>
        <h2>Instant Notifications</h2>
        <Toggle name="applicationReceived" label="New applications on my tasks" />
        <Toggle name="applicationAccepted" label="My application was accepted" />
        <Toggle name="messageReceived" label="New messages" />
        {/* ... more toggles */}
      </section>

      <section>
        <h2>Digest Notifications</h2>
        <Select name="digestFrequency" options={['daily', 'weekly', 'never']} />
      </section>

      <section>
        <h2>Notification Channel</h2>
        <Radio name="channel" options={['telegram', 'email', 'sms']} />
      </section>
    </div>
  );
}
```

## Related Files

### Existing Files to Modify
- `/src/app/api/applications/route.ts` - Add notification after application creation
- `/src/app/api/applications/[id]/accept/route.ts` - Add notification after acceptance
- `/src/app/api/applications/[id]/reject/route.ts` - Add notification after rejection
- `/src/app/api/messages/route.ts` - Add notification after message creation
- `/src/app/api/tasks/[id]/route.ts` - Add notification after task status change

### New Files to Create
- `/src/app/api/cron/weekly-digest/route.ts` - Weekly task digest cron job
- `/src/app/api/cron/deadline-reminders/route.ts` - Task deadline reminders
- `/src/app/api/cron/inactive-users/route.ts` - Re-engagement for inactive users
- `/src/app/[lang]/settings/notifications/page.tsx` - Notification settings UI
- `/src/lib/services/digest-notifications.ts` - Digest notification logic
- `/supabase/migrations/add_notification_preferences.sql` - Schema updates

### Configuration Files
- `/vercel.json` - Add cron job schedules
- `/.env.local` - Add `CRON_SECRET` for securing cron endpoints

## Priority

**High** - Notifications are critical for user engagement and platform success:
- ✅ Professionals discover relevant tasks (improves application rate)
- ✅ Customers stay informed about applications (reduces response time)
- ✅ Users stay engaged with the platform (reduces churn)
- ✅ Zero cost with Telegram (vs expensive SMS/email alternatives)

## Dependencies

### Completed
- ✅ Telegram authentication system
- ✅ Telegram notification service
- ✅ Notification logging infrastructure
- ✅ User database with Telegram fields

### Required Before Implementation
- [ ] Notification preferences schema
- [ ] Cron job infrastructure (Vercel or Supabase)
- [ ] Notification settings UI
- [ ] Application/message API endpoints with proper hooks

### External Services
- Vercel Cron (free tier: 10 cron jobs)
- OR Supabase pg_cron (included with Supabase)

## Estimated Effort

### Phase 1: Core Instant Notifications (Priority)
- **Database schema**: 1 hour
- **Application received notification**: 2 hours
- **Application accepted notification**: 2 hours
- **Integration with existing APIs**: 3 hours
- **Testing**: 2 hours
- **Total**: ~10 hours (~1.5 days)

### Phase 2: Weekly Task Digest
- **Digest service implementation**: 4 hours
- **Cron job setup**: 2 hours
- **Message formatting and grouping**: 2 hours
- **Testing with real data**: 2 hours
- **Total**: ~10 hours (~1.5 days)

### Phase 3: Notification Settings UI
- **Settings page UI**: 4 hours
- **API endpoints for preferences**: 2 hours
- **Preference validation logic**: 2 hours
- **Testing**: 2 hours
- **Total**: ~10 hours (~1.5 days)

### Phase 4: Additional Notifications
- **Message notifications**: 2 hours
- **Task status notifications**: 2 hours
- **Payment notifications**: 2 hours
- **Review notifications**: 2 hours
- **Testing**: 2 hours
- **Total**: ~10 hours (~1.5 days)

**Grand Total**: ~40 hours (~5-6 days for complete implementation)

## Success Metrics

### Engagement Metrics
- [ ] 70%+ notification open rate (Telegram)
- [ ] 50%+ click-through rate on notification links
- [ ] 30% increase in application rate after weekly digest
- [ ] 80% of customers respond to applications within 24 hours

### Technical Metrics
- [ ] 99%+ notification delivery rate
- [ ] <5 second notification delivery time
- [ ] Zero failed notifications due to system errors
- [ ] All notifications logged in database

### User Satisfaction
- [ ] <1% unsubscribe rate from notifications
- [ ] Positive feedback on notification timing and relevance
- [ ] Users cite notifications as helpful in surveys

## Risks & Mitigations

### Risk 1: Notification fatigue (too many notifications)
**Mitigation:**
- Default to conservative notification settings
- Group related notifications (e.g., "3 new applications" vs separate messages)
- Allow granular control in settings
- Implement "quiet hours" feature

### Risk 2: Cron job failures
**Mitigation:**
- Set up monitoring and alerts
- Implement retry logic with exponential backoff
- Log all cron executions
- Have fallback to manual trigger

### Risk 3: Spam or abuse
**Mitigation:**
- Rate limit notifications per user (max X per day)
- Detect and prevent notification spam patterns
- Easy unsubscribe/mute options
- Monitor notification_logs for anomalies

### Risk 4: Users without Telegram
**Mitigation:**
- Implement email fallback
- Prompt users to set up Telegram during onboarding
- Show benefits of Telegram notifications in UI

### Risk 5: GDPR compliance
**Mitigation:**
- Clear consent during registration
- Easy opt-out mechanisms
- Respect notification preferences
- Document data usage in privacy policy

## Implementation Phases

### Phase 1: Foundation (Week 1) - PRIORITY
1. Database schema for notification preferences
2. Basic notification settings UI
3. Application received notification (instant)
4. Application accepted notification (instant)
5. Testing and deployment

### Phase 2: Digest System (Week 2)
1. Weekly task digest implementation
2. Cron job setup and testing
3. Digest preference controls
4. Monitor and optimize

### Phase 3: Additional Triggers (Week 3)
1. Message notifications
2. Task status notifications
3. Payment notifications
4. Review notifications

### Phase 4: Advanced Features (Week 4)
1. Deadline reminders
2. Re-engagement campaigns
3. Advanced preference controls
4. Analytics dashboard

## Notes

- **Start with Phase 1** - These are the highest-impact notifications for platform engagement
- **Telegram-first strategy** - 90% of users will use Telegram, optimize for this
- **Keep it simple** - Better to have 3 great notifications than 10 mediocre ones
- **Monitor metrics** - Track open rates, click-through, and user feedback
- **Iterate based on data** - Adjust frequency and content based on real usage

**Cost Comparison:**
- Telegram: €0 for unlimited notifications
- Email (SendGrid): ~€0.001/email = €400/month for 40k users
- SMS (Twilio): ~€0.05/SMS = €2,000/month for 40k users
- **Savings**: €2,000-24,000 per year by using Telegram

## Links & Resources

### Implementation
- Vercel Cron: https://vercel.com/docs/cron-jobs
- Supabase pg_cron: https://supabase.com/docs/guides/database/extensions/pg_cron
- Telegram Bot API: https://core.telegram.org/bots/api

### Design Inspiration
- Upwork notifications
- Fiverr notifications
- TaskRabbit notifications

### User Research
- Survey users on preferred notification frequency
- A/B test notification content and timing
- Monitor unsubscribe rates closely

---

**Status**: Ready for implementation
**Last Updated**: 2025-10-31
**Priority**: High - Phase 1 should start immediately after Telegram auth deployment
