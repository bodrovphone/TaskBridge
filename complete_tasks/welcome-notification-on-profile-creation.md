# Welcome Notification on Profile Creation

## Overview
Send instant welcome notification to users via Telegram when they first create their profile. This improves user engagement and demonstrates the value of Telegram notifications immediately.

## Business Value
- **Instant Engagement**: Users see Telegram's value immediately after connecting
- **Activation Rate**: Higher chance users complete profile setup
- **Trust Building**: Professional welcome message sets tone
- **Feature Discovery**: Introduces users to notification system

## User Flow

### Scenario 1: Sign Up with Email/Password
```
User signs up (email/password)
  ↓
Profile created in database
  ↓
User redirected to profile page
  ↓
User sees Telegram connection prompt
  ↓
User clicks "Connect Telegram"
  ↓
Telegram connection succeeds (telegram_id saved)
  ↓
✅ SEND WELCOME NOTIFICATION TO TELEGRAM
```

### Scenario 2: OAuth (Google/Facebook)
```
User clicks "Sign in with Google"
  ↓
OAuth flow completes
  ↓
Profile created in database
  ↓
User lands on homepage/dashboard
  ↓
User navigates to profile
  ↓
User connects Telegram
  ↓
✅ SEND WELCOME NOTIFICATION TO TELEGRAM
```

### Scenario 3: Direct Telegram Login (Future)
```
User clicks "Login with Telegram" in auth-slide-over
  ↓
Telegram OAuth completes
  ↓
Profile created with telegram_id already set
  ↓
✅ SEND WELCOME NOTIFICATION IMMEDIATELY
```

## Implementation Tasks

### 1. Create Notification Service ⏳
**File**: `/src/server/services/notification.service.ts`

```typescript
export class NotificationService {
  /**
   * Send welcome notification to newly registered user
   */
  async sendWelcomeNotification(userId: string) {
    const user = await userRepository.findById(userId)

    if (!user.telegramId) {
      // User hasn't connected Telegram yet, skip
      return
    }

    const message = this.formatWelcomeMessage(user)
    await this.sendTelegramNotification(user.telegramId, message)
  }

  private formatWelcomeMessage(user: User): string {
    const firstName = user.telegramFirstName || user.fullName?.split(' ')[0] || 'there'

    return `
👋 <b>Welcome to Trudify, ${firstName}!</b>

Your account is ready to go! Here's what you can do now:

<b>Looking for help?</b>
• Browse professionals in your area
• Post a task and get offers
• Message professionals directly

<b>Offering services?</b>
• Complete your professional profile
• Get notified when new tasks are posted
• Build your reputation with reviews

You'll receive instant notifications here for:
✅ New applications on your tasks
✅ Application status updates
✅ New messages
✅ Task completions

<a href="https://task-bridge-chi.vercel.app">Open Trudify</a>

Need help? Just reply to this message!
    `.trim()
  }

  private async sendTelegramNotification(telegramId: bigint, message: string) {
    const botToken = process.env.TG_BOT_TOKEN
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId.toString(),
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    })
  }
}
```

### 2. Update Telegram Connection Handler ⏳
**File**: `/src/lib/services/telegram-bot-handler.ts`

Add welcome notification after successful connection:

```typescript
async function handleConnectionRequest(token: string, telegramId: number, telegramUser: any) {
  // ... existing token validation ...

  // Update user with Telegram credentials
  const { error: updateError } = await supabase
    .from('users')
    .update({
      telegram_id: telegramId,
      telegram_username: telegramUser?.username || null,
      telegram_first_name: telegramUser?.first_name,
      telegram_last_name: telegramUser?.last_name || null,
      preferred_notification_channel: 'telegram',
      updated_at: new Date().toISOString()
    })
    .eq('id', tokenData.user_id)

  if (updateError) {
    // ... error handling ...
    return
  }

  // ✅ NEW: Send welcome notification
  const notificationService = new NotificationService()
  await notificationService.sendWelcomeNotification(tokenData.user_id)

  // Send connection success message
  await sendTelegramMessage(telegramId, `✅ Successfully Connected! ...`)
}
```

### 3. Update Sign Up Flow ⏳
**File**: `/src/features/auth/hooks/use-auth.ts` or sign-up endpoint

After profile creation, check if user connected via Telegram OAuth:

```typescript
async function signUp(email: string, password: string, fullName: string) {
  // ... existing sign up logic ...

  // If user signed up with Telegram OAuth (has telegram_id)
  if (newProfile.telegramId) {
    const notificationService = new NotificationService()
    await notificationService.sendWelcomeNotification(newProfile.id)
  }

  return { user, profile: newProfile }
}
```

### 4. Add Notification Logging Table (Optional but Recommended) ⏳
Track all notifications sent for debugging and analytics:

```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'welcome', 'new_application', 'message', etc.
  channel TEXT NOT NULL, -- 'telegram', 'email', 'push'
  status TEXT NOT NULL, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_notification_logs_user (user_id),
  INDEX idx_notification_logs_type (notification_type),
  INDEX idx_notification_logs_sent_at (sent_at)
);
```

### 5. Add Welcome Notification Translations ⏳
**Files**:
- `/src/lib/intl/en/notifications.ts`
- `/src/lib/intl/bg/notifications.ts`
- `/src/lib/intl/ru/notifications.ts`

```typescript
export const notifications = {
  'notifications.welcome.title': 'Welcome to Trudify!',
  'notifications.welcome.subtitle': 'Your account is ready',
  'notifications.welcome.customerCTA': 'Post your first task',
  'notifications.welcome.professionalCTA': 'Complete your profile',
  // ... etc
}
```

## Testing Checklist

- [ ] **Test Email Sign Up**
  - Sign up with email/password
  - Connect Telegram on profile page
  - Verify welcome message received in Telegram

- [ ] **Test Google OAuth**
  - Sign in with Google
  - Connect Telegram
  - Verify welcome message received

- [ ] **Test Facebook OAuth**
  - Sign in with Facebook
  - Connect Telegram
  - Verify welcome message received

- [ ] **Test Telegram Direct Login** (When implemented)
  - Login with Telegram OAuth
  - Verify welcome message sent immediately
  - No need to manually connect

- [ ] **Test Error Handling**
  - User blocks bot before welcome message → Should fail gracefully
  - Invalid telegram_id → Should log error, not crash
  - Network timeout → Should retry or log

## Analytics to Track

- **Welcome Notification Sent**: Count how many sent successfully
- **Welcome Notification Failed**: Track failures and reasons
- **User Engagement**: % of users who click link in welcome message
- **Time to First Action**: Time between welcome notification and first task post/application

## Edge Cases to Handle

1. **User Disconnects and Reconnects Telegram**
   - Should NOT send welcome notification again
   - Check if notification already sent via notification_logs table

2. **User Creates Multiple Accounts**
   - Each account gets welcome notification
   - Track by user_id, not telegram_id

3. **Bot Blocked by User**
   - Telegram API returns error code 403
   - Mark user as telegram_blocked in database
   - Hide "Connected" status in UI

4. **Rate Limiting**
   - Telegram Bot API: 30 messages/second
   - For bulk operations, implement queue system

## Priority
**HIGH** - Implement after basic notification infrastructure is ready

## Estimated Effort
- Notification service setup: 2 hours
- Welcome message implementation: 1 hour
- Integration with auth flows: 2 hours
- Testing: 1 hour
- **Total: ~6 hours**

## Dependencies
- ✅ Telegram bot webhook configured
- ✅ Telegram connection flow working
- ⏳ Notification service infrastructure
- ⏳ Notification logs table (optional)

## Success Metrics
- 90%+ welcome notifications delivered successfully
- <5% failure rate
- Average user responds/clicks within 24 hours
- Increased profile completion rate

## Related Files
- `/src/server/services/notification.service.ts` - To be created
- `/src/lib/services/telegram-bot-handler.ts` - Update existing
- `/src/features/auth/hooks/use-auth.ts` - Update existing
- `/docs/telegram-implementation-status.md` - Update when complete

## Future Enhancements
- **Personalized Welcome**: Different message for customers vs professionals
- **Localized Welcome**: Send in user's preferred language (BG/RU/EN)
- **Interactive Welcome**: Include inline keyboard buttons for quick actions
- **Welcome Series**: Send follow-up tips 24h and 7 days later
- **A/B Testing**: Test different welcome message variants
