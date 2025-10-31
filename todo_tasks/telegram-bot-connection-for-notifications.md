# Telegram Bot Connection for Notifications

## Task Description
Implement two methods for users to connect their Telegram account to receive notifications:
1. **Method A**: Login with Telegram (browser-based, phone number flow) → Already implemented, upgrade package
2. **Method B**: Email/password login → Connect Telegram bot later via Profile Settings for notifications

Both methods result in users receiving free Telegram notifications.

## Problem
Current Telegram Login Widget asks for phone number (browser-based), which isn't the seamless UX originally expected. However, users still want Telegram notifications. We need to:
- Accept that browser-based auth is normal (upgrade to better package)
- Provide alternative: Connect Telegram AFTER email/password login
- Give users control: Enable/disable Telegram notifications in settings

## Requirements

### Phase 1: Upgrade Telegram Login Package
- [ ] Replace `react-telegram-login` with `@telegram-auth/react`
- [ ] Test login flow still works
- [ ] Update TypeScript types
- [ ] Verify auth verification logic still works

### Phase 2: Profile Settings - Connect Telegram Bot
- [ ] Add "Connect Telegram" section in Profile Settings
- [ ] Show connection status (Connected ✅ / Not Connected)
- [ ] Show "Connect Telegram Bot" button if not connected
- [ ] Implement deep link: `t.me/Trudify_bot?start=connect_{userId}`
- [ ] Handle bot `/start` command with connection token
- [ ] Store connection in database
- [ ] Show success message after connection

### Phase 3: Notification Preferences UI
- [ ] Add "Notification Settings" section in Profile
- [ ] Toggle for each notification type:
  - New applications on tasks
  - Application accepted/rejected
  - New messages
  - Task status updates
  - Payment received
  - Weekly task digest
- [ ] Choose notification channel: Telegram / Email / Both
- [ ] Save preferences to database

### Phase 4: Bot Implementation
- [ ] Implement `/start` command handler
- [ ] Parse connection token from deep link
- [ ] Verify token and link Telegram ID to user
- [ ] Send confirmation message to user
- [ ] Update database with telegram_id

## Acceptance Criteria

### Telegram Login (Method A)
- [x] User can login with Telegram via browser (phone number prompt)
- [x] Using better package `@telegram-auth/react` (modern, maintained)
- [x] Account created with Telegram credentials
- [x] Welcome notification sent automatically
- [ ] Clear messaging: "First time users: You'll enter your phone number in browser"

### Profile Telegram Connection (Method B)
- [ ] Logged-in users see "Connect Telegram" in Profile Settings
- [ ] Clicking button opens Telegram app with bot
- [ ] Bot sends message: "Click button to connect to Trudify"
- [ ] User clicks button → Telegram connected ✅
- [ ] telegram_id stored in database
- [ ] User can disconnect/reconnect anytime

### Notification Preferences
- [ ] Users can enable/disable each notification type
- [ ] Users can choose Telegram vs Email
- [ ] If Telegram not connected, show "Connect Telegram to enable"
- [ ] Settings saved immediately

### Testing
- [ ] Test Telegram login flow (Method A)
- [ ] Test email login → connect bot (Method B)
- [ ] Test sending notification to connected users
- [ ] Test preferences (enable/disable notifications)
- [ ] Test disconnecting Telegram

## Technical Implementation

### 1. Upgrade to @telegram-auth/react

**Install package:**
```bash
npm install @telegram-auth/react @telegram-auth/server
npm uninstall react-telegram-login
```

**Replace in auth-slide-over.tsx:**
```typescript
// OLD
import TelegramLoginButton from 'react-telegram-login';

// NEW
import { LoginButton } from '@telegram-auth/react';

// Usage
<LoginButton
  botUsername="Trudify_bot"
  onAuthCallback={(data) => handleTelegramAuth(data)}
  buttonSize="large"
  cornerRadius={8}
  showAvatar={false}
  lang={i18n.language}
/>
```

**Update types:**
```typescript
import type { TelegramAuthData } from '@telegram-auth/server';

const handleTelegramAuth = async (data: TelegramAuthData) => {
  // Same logic as before
  const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

---

### 2. Profile Settings - Connect Telegram UI

**File**: `/src/app/[lang]/profile/components/telegram-connection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

interface TelegramConnectionProps {
  userId: string;
  telegramConnected: boolean;
  telegramUsername?: string;
}

export function TelegramConnection({
  userId,
  telegramConnected,
  telegramUsername
}: TelegramConnectionProps) {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);

    // Generate connection token
    const response = await fetch('/api/telegram/generate-connection-token', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });

    const { token } = await response.json();

    // Open Telegram with deep link
    const deepLink = `https://t.me/Trudify_bot?start=connect_${token}`;
    window.open(deepLink, '_blank');

    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    const response = await fetch('/api/telegram/disconnect', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      window.location.reload(); // Refresh to show updated status
    }
  };

  return (
    <Card>
      <CardBody className="gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {t('profile.telegramNotifications')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('profile.telegramDescription')}
            </p>
          </div>

          {telegramConnected ? (
            <Chip color="success" variant="flat">
              ✅ {t('profile.connected')}
            </Chip>
          ) : (
            <Chip color="default" variant="flat">
              {t('profile.notConnected')}
            </Chip>
          )}
        </div>

        {telegramConnected && telegramUsername && (
          <div className="text-sm text-gray-600">
            {t('profile.connectedAs')}: <strong>@{telegramUsername}</strong>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <strong>{t('profile.benefits')}:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>{t('profile.instantNotifications')}</li>
            <li>{t('profile.freeForever')}</li>
            <li>{t('profile.noEmailSpam')}</li>
            <li>{t('profile.richMessages')}</li>
          </ul>
        </div>

        {telegramConnected ? (
          <Button
            color="danger"
            variant="flat"
            onPress={handleDisconnect}
          >
            {t('profile.disconnectTelegram')}
          </Button>
        ) : (
          <Button
            color="primary"
            onPress={handleConnect}
            isLoading={isConnecting}
            startContent={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.764 8.317c-.132.589-.482.732-.979.455l-2.7-1.988-1.303 1.255c-.144.144-.264.264-.542.264l.193-2.74 4.994-4.512c.217-.193-.047-.3-.336-.107l-6.17 3.883-2.66-.832c-.578-.18-.589-.578.12-.857l10.393-4.006c.482-.18.902.107.744.857z"/>
              </svg>
            }
          >
            {t('profile.connectTelegram')}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
```

---

### 3. Generate Connection Token API

**File**: `/src/app/api/telegram/generate-connection-token/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token with expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const supabase = await createClient();

    // Store in connection_tokens table
    await supabase
      .from('telegram_connection_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    return NextResponse.json({ token });

  } catch (error) {
    console.error('Error generating connection token:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

### 4. Telegram Bot /start Handler

**File**: `/src/lib/services/telegram-bot-handler.ts`

```typescript
/**
 * Telegram Bot Command Handler
 *
 * Handles /start command with connection token
 * Deep link format: t.me/Trudify_bot?start=connect_{token}
 */

import { createClient } from '@/lib/supabase/server';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

export async function handleTelegramBotUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message || !message.text) return;

  // Check if it's a /start command
  if (!message.text.startsWith('/start')) return;

  const text = message.text;
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;

  // Parse command: /start connect_{token}
  if (text.includes('connect_')) {
    const token = text.split('connect_')[1];
    await handleConnectionRequest(token, telegramUserId, message.from);
  } else {
    // Regular /start - welcome message
    await sendWelcomeMessage(chatId);
  }
}

async function handleConnectionRequest(
  token: string,
  telegramId: number,
  telegramUser: any
) {
  const supabase = await createClient();

  // Verify token
  const { data: tokenData, error: tokenError } = await supabase
    .from('telegram_connection_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (tokenError || !tokenData) {
    // Token invalid or expired
    await sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Link Expired</b>\n\nPlease generate a new connection link from your profile settings.',
      'HTML'
    );
    return;
  }

  // Mark token as used
  await supabase
    .from('telegram_connection_tokens')
    .update({ used: true })
    .eq('token', token);

  // Update user with Telegram credentials
  const { error: updateError } = await supabase
    .from('users')
    .update({
      telegram_id: telegramId,
      telegram_username: telegramUser.username,
      telegram_first_name: telegramUser.first_name,
      telegram_last_name: telegramUser.last_name,
      preferred_notification_channel: 'telegram',
      updated_at: new Date().toISOString()
    })
    .eq('id', tokenData.user_id);

  if (updateError) {
    await sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Failed</b>\n\nPlease try again or contact support.',
      'HTML'
    );
    return;
  }

  // Success! Send confirmation
  await sendTelegramMessage(
    telegramId,
    `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\nYou'll receive instant notifications for:\n• New applications on your tasks\n• Application status updates\n• New messages\n• Payment confirmations\n\nYou can manage notification preferences in your profile settings.`,
    'HTML'
  );
}

async function sendWelcomeMessage(chatId: number) {
  await sendTelegramMessage(
    chatId,
    `👋 <b>Welcome to Trudify!</b>\n\nTo connect your Telegram account:\n1. Login to Trudify website\n2. Go to Profile Settings\n3. Click "Connect Telegram"\n\nThis will enable instant notifications for all your tasks and applications!`,
    'HTML'
  );
}

async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) return;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode
    })
  });
}
```

---

### 5. Bot Webhook API Route

**File**: `/src/app/api/telegram/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramBotUpdate } from '@/lib/services/telegram-bot-handler';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook is from Telegram (optional but recommended)
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');

    if (secretToken !== process.env.TG_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await request.json();

    // Handle the update asynchronously
    handleTelegramBotUpdate(update);

    // Return 200 immediately (Telegram requirement)
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

### 6. Database Schema Updates

```sql
-- Create telegram connection tokens table
CREATE TABLE IF NOT EXISTS telegram_connection_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telegram_tokens_user ON telegram_connection_tokens(user_id);
CREATE INDEX idx_telegram_tokens_token ON telegram_connection_tokens(token);
CREATE INDEX idx_telegram_tokens_expires ON telegram_connection_tokens(expires_at);

-- Update users table notification preferences
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "applicationReceived": true,
  "applicationAccepted": true,
  "applicationRejected": true,
  "messageReceived": true,
  "taskStatusChanged": true,
  "paymentReceived": true,
  "reviewReceived": true,
  "weeklyTaskDigest": true,
  "channel": "telegram"
}'::jsonb;
```

---

### 7. Setup Telegram Webhook

**Using BotFather:**
```bash
# Set webhook URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://task-bridge-chi.vercel.app/api/telegram/webhook" \
  -d "secret_token=<YOUR_SECRET>"

# Verify webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Add to environment variables:**
```bash
TG_WEBHOOK_SECRET=your_random_secret_string
```

---

## Translation Keys

Add to `/src/lib/intl/en/profile.ts`:

```typescript
'profile.telegramNotifications': 'Telegram Notifications',
'profile.telegramDescription': 'Connect your Telegram account to receive instant, free notifications.',
'profile.connected': 'Connected',
'profile.notConnected': 'Not Connected',
'profile.connectedAs': 'Connected as',
'profile.benefits': 'Benefits',
'profile.instantNotifications': 'Instant notifications (no delays)',
'profile.freeForever': 'Free forever (no SMS costs)',
'profile.noEmailSpam': 'No email spam',
'profile.richMessages': 'Rich messages with buttons and links',
'profile.connectTelegram': 'Connect Telegram',
'profile.disconnectTelegram': 'Disconnect Telegram',
```

(Repeat for `bg` and `ru` translations)

---

## User Flow Examples

### Flow 1: Login with Telegram (Method A)
```
1. User visits site
2. Clicks "Login with Telegram" in auth slide-over
3. Browser tab opens → Enter phone number
4. Enter SMS code
5. ✅ Logged in with Telegram connected
6. Welcome notification sent automatically
```

### Flow 2: Email Login → Connect Telegram (Method B)
```
1. User registers with email/password
2. Logs in
3. Goes to Profile → Settings
4. Sees "Connect Telegram" section
5. Clicks "Connect Telegram" button
6. Telegram app opens → Bot message appears
7. User clicks "Connect" button in bot
8. ✅ Telegram connected
9. Confirmation message in Telegram
10. Can now receive notifications
```

---

## Testing Checklist

### Telegram Login Widget
- [ ] Login works with phone number flow
- [ ] User account created with telegram_id
- [ ] Welcome notification sent
- [ ] No TypeScript errors with new package

### Telegram Bot Connection
- [ ] Connection token generated
- [ ] Deep link opens Telegram app
- [ ] Bot /start command received
- [ ] Token validated correctly
- [ ] User telegram_id updated in database
- [ ] Confirmation message sent
- [ ] Expired tokens rejected

### Notifications
- [ ] Send notification to Telegram-connected user
- [ ] Notification delivered successfully
- [ ] Logged in notification_logs table
- [ ] Respects user preferences (enable/disable)

### UI/UX
- [ ] Connection status shows correctly (Connected/Not Connected)
- [ ] Button states work (loading, disabled)
- [ ] Success/error messages displayed
- [ ] Disconnect works properly
- [ ] Can reconnect after disconnect

---

## Priority

**High** - This is the core feature that enables cost-free notifications and improves user engagement.

## Estimated Effort

- **Phase 1** (Upgrade package): 2 hours
- **Phase 2** (Profile UI): 4 hours
- **Phase 3** (Notification prefs): 3 hours
- **Phase 4** (Bot handler): 5 hours
- **Testing**: 3 hours
- **Total**: ~17 hours (~2-3 days)

## Success Metrics

- [ ] 60%+ of users connect Telegram (Method A or B)
- [ ] 95%+ notification delivery rate
- [ ] <2 second notification delivery time
- [ ] Zero failed bot connections
- [ ] Positive user feedback on notifications

---

**Status**: Ready to implement
**Last Updated**: 2025-10-31
**Next Steps**:
1. Upgrade to @telegram-auth/react
2. Deploy and test login still works
3. Implement profile connection feature
4. Set up bot webhook
