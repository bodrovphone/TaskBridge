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
    const token = text.split('connect_')[1]?.trim();
    if (token) {
      await handleConnectionRequest(token, telegramUserId, message.from);
    }
  } else {
    // Regular /start - welcome message
    await sendWelcomeMessage(chatId);
  }
}

async function handleConnectionRequest(
  token: string,
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from']
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
      '❌ <b>Connection Link Expired</b>\n\nPlease generate a new connection link from your profile settings on Trudify website.',
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
      telegram_username: telegramUser?.username || null,
      telegram_first_name: telegramUser?.first_name,
      telegram_last_name: telegramUser?.last_name || null,
      preferred_notification_channel: 'telegram',
      updated_at: new Date().toISOString()
    })
    .eq('id', tokenData.user_id);

  if (updateError) {
    console.error('Error updating user with Telegram credentials:', updateError);
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
    `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• New messages from clients/professionals\n• Task completion confirmations\n• Payment notifications\n\nYou can manage notification preferences in your profile settings on the website.`,
    'HTML'
  );
}

async function sendWelcomeMessage(chatId: number) {
  await sendTelegramMessage(
    chatId,
    `👋 <b>Welcome to Trudify!</b>\n\nTrudify connects customers with verified professionals for various services in Bulgaria.\n\n<b>To connect your Telegram account:</b>\n1. Login to Trudify website (task-bridge-chi.vercel.app)\n2. Go to Profile → Settings\n3. Click "Connect Telegram"\n4. Follow the link that opens\n\nThis will enable instant notifications for all your tasks and applications!`,
    'HTML'
  );
}

async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('TG_BOT_TOKEN not configured');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
