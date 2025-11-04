/**
 * Telegram Bot Command Handler
 *
 * Handles /start command with connection token
 * Deep link format: t.me/Trudify_bot?start=connect_{token}
 */

import { createAdminClient } from '@/lib/supabase/server';

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
  console.log('[Telegram Handler] Processing update:', {
    update_id: update.update_id,
    has_message: !!update.message,
    message_text: update.message?.text
  });

  const message = update.message;
  if (!message || !message.text) {
    console.log('[Telegram Handler] No message or text, skipping');
    return;
  }

  const text = message.text;
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;

  console.log('[Telegram Handler] Processing command:', {
    text,
    chatId,
    telegramUserId,
    username: message.from.username
  });

  // Handle /connect CODE command (manual code entry)
  if (text.startsWith('/connect ')) {
    const code = text.split('/connect ')[1]?.trim().toUpperCase();
    console.log('[Telegram Handler] Processing /connect command with code:', code);
    if (code && code.length === 8) {
      await handleConnectionByCode(code, telegramUserId, message.from);
    } else {
      await sendTelegramMessage(
        chatId,
        '❌ <b>Invalid Code</b>\n\nPlease use the format: <code>/connect ABCD1234</code>\n\nGet your connection code from your profile settings on Trudify website.',
        'HTML'
      );
    }
    return;
  }

  // Check if it's a /start command
  if (!message.text.startsWith('/start')) {
    console.log('[Telegram Handler] Unknown command, skipping');
    return;
  }

  console.log('[Telegram Handler] Processing /start command');

  // Parse command: /start connect_{token}
  if (text.includes('connect_')) {
    const token = text.split('connect_')[1]?.trim();
    console.log('[Telegram Handler] Found connection token:', {
      hasToken: !!token,
      tokenLength: token?.length
    });
    if (token) {
      await handleConnectionRequest(token, telegramUserId, message.from);
    } else {
      console.error('[Telegram Handler] Token parsing failed from text:', text);
    }
  } else {
    // Regular /start - welcome message
    console.log('[Telegram Handler] Sending welcome message to chatId:', chatId);
    await sendWelcomeMessage(chatId);
  }
}

async function handleConnectionRequest(
  token: string,
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from']
) {
  console.log('[Telegram] Processing connection request:', {
    token: token.substring(0, 10) + '...',
    telegramId,
    username: telegramUser.username
  });

  const supabase = createAdminClient();

  // Verify token
  const { data: tokenData, error: tokenError } = await supabase
    .from('telegram_connection_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (tokenError || !tokenData) {
    console.error('[Telegram] Token validation failed:', tokenError);
    // Token invalid or expired
    await sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Link Expired</b>\n\nPlease generate a new connection link from your profile settings on Trudify website.',
      'HTML'
    );
    return;
  }

  console.log('[Telegram] Token validated for user:', tokenData.user_id);

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
    console.error('[Telegram] Error updating user with Telegram credentials:', updateError);
    await sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Failed</b>\n\nPlease try again or contact support.',
      'HTML'
    );
    return;
  }

  console.log('[Telegram] Successfully connected user:', tokenData.user_id);

  // Success! Send confirmation
  await sendTelegramMessage(
    telegramId,
    `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• New messages from clients/professionals\n• Task completion confirmations\n• Payment notifications\n\nYou can manage notification preferences in your profile settings on the website.`,
    'HTML'
  );
}

async function handleConnectionByCode(
  code: string,
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from']
) {
  console.log('[Telegram] Processing connection by code:', {
    code,
    telegramId,
    username: telegramUser.username
  });

  const supabase = createAdminClient();

  // Find token that starts with this code (case-insensitive)
  // Token is 64 chars, code is first 8 chars uppercase
  const { data: tokens, error: tokenError } = await supabase
    .from('telegram_connection_tokens')
    .select('*')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString());

  if (tokenError) {
    console.error('[Telegram] Error querying tokens:', tokenError);
    await sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Failed</b>\n\nDatabase error. Please try again or contact support.',
      'HTML'
    );
    return;
  }

  // Find token matching the code (first 8 chars)
  const tokenData = tokens?.find(t =>
    t.token.substring(0, 8).toUpperCase() === code
  );

  if (!tokenData) {
    console.log('[Telegram] No matching token found for code:', code);
    await sendTelegramMessage(
      telegramId,
      '❌ <b>Invalid or Expired Code</b>\n\nThis connection code is invalid or has expired. Please generate a new code from your profile settings on Trudify website.',
      'HTML'
    );
    return;
  }

  console.log('[Telegram] Found matching token for user:', tokenData.user_id);

  // Use the existing connection handler with the full token
  await handleConnectionRequest(tokenData.token, telegramId, telegramUser);
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
