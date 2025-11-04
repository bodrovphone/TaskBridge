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
  try {
    const message = update.message;
    if (!message || !message.text) return;

    const text = message.text;
    const chatId = message.chat.id;
    const telegramUserId = message.from.id;

    // Handle /connect CODE command (manual code entry)
    if (text.startsWith('/connect ')) {
      const code = text.split('/connect ')[1]?.trim().toUpperCase();
      if (code && code.length === 8) {
        await handleConnectionByCode(code, telegramUserId, message.from);
      } else {
        // Fire-and-forget invalid code message
        sendTelegramMessage(
          chatId,
          '❌ <b>Invalid Code</b>\n\nPlease use the format: <code>/connect ABCD1234</code>\n\nGet your connection code from your profile settings on Trudify website.',
          'HTML'
        ).catch(err => console.error('[Telegram] Failed to send invalid code format message:', err));
      }
      return;
    }

  // Check if it's a /start command
  if (!message.text.startsWith('/start')) return;

  // Parse command: /start connect_{token}
  if (text.includes('connect_')) {
    const token = text.split('connect_')[1]?.trim();
    if (token) {
      await handleConnectionRequest(token, telegramUserId, message.from);
    } else {
      console.error('[Telegram] Token parsing failed from /start command');
    }
  } else {
    // Regular /start - welcome message (fire-and-forget)
    sendWelcomeMessage(chatId);
  }
  } catch (error) {
    console.error('[Telegram Handler] FATAL EXCEPTION:', error);
    console.error('[Telegram Handler] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
    // Token invalid or expired - fire-and-forget
    sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Link Expired</b>\n\nPlease generate a new connection link from your profile settings on Trudify website.',
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send expired token message:', err));
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
    // Fire-and-forget error message
    sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Failed</b>\n\nPlease try again or contact support.',
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send error message:', err));
    return;
  }

  console.log('[Telegram] Successfully connected user:', tokenData.user_id);

  // Success! Send confirmation - fire-and-forget
  sendTelegramMessage(
    telegramId,
    `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• New messages from clients/professionals\n• Task completion confirmations\n• Payment notifications\n\nYou can manage notification preferences in your profile settings on the website.`,
    'HTML'
  ).catch(err => console.error('[Telegram] Failed to send success message:', err));
}

async function handleConnectionByCode(
  code: string,
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from']
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error('[Telegram] Failed to create admin client:', error);
    // Fire-and-forget error message
    sendTelegramMessage(
      telegramId,
      '❌ <b>Server Configuration Error</b>\n\nPlease contact support.',
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send config error message:', err));
    return;
  }

  // Find token that starts with this code - with retry logic
  let tokens, tokenError;
  let retries = 3;

  while (retries > 0) {
    try {
      const result = await supabase
        .from('telegram_connection_tokens')
        .select('*')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString());

      tokens = result.data;
      tokenError = result.error;

      // If successful or non-network error, break
      if (!tokenError || tokenError.message !== 'TypeError: fetch failed') {
        break;
      }

      retries--;
      if (retries > 0) {
        console.log(`[Telegram] Token query failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      }
    } catch (error) {
      retries--;
      if (retries > 0) {
        console.log(`[Telegram] Exception during token query, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.error('[Telegram] Exception during token query after retries:', error);
        // Fire-and-forget error message
        sendTelegramMessage(
          telegramId,
          '❌ <b>Database Error</b>\n\nPlease try again or contact support.',
          'HTML'
        ).catch(err => console.error('[Telegram] Failed to send db error message:', err));
        return;
      }
    }
  }

  if (tokenError) {
    console.error('[Telegram] Token query error:', tokenError);
    // Fire-and-forget error message
    sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Failed</b>\n\nDatabase error. Please try again or contact support.',
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send query error message:', err));
    return;
  }

  // Find token matching the code (first 8 chars)
  const tokenData = tokens?.find(t =>
    t.token.substring(0, 8).toUpperCase() === code
  );

  if (!tokenData) {
    // Fire-and-forget: Don't wait for message to send
    sendTelegramMessage(
      telegramId,
      '❌ <b>Invalid or Expired Code</b>\n\nThis connection code is invalid or has expired. Please generate a new code from your profile settings on Trudify website.',
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send invalid code message:', err));
    return;
  }

  // Mark token as used
  await supabase
    .from('telegram_connection_tokens')
    .update({ used: true })
    .eq('token', tokenData.token);

  // Update user with Telegram credentials
  try {
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
      console.error('[Telegram] User update error:', updateError);
      // Fire-and-forget: Don't wait for error message
      sendTelegramMessage(
        telegramId,
        '❌ <b>Connection Failed</b>\n\nDatabase error. Please try again or contact support.',
        'HTML'
      ).catch(err => console.error('[Telegram] Failed to send error message:', err));
      return;
    }

    console.log('[Telegram] User connected successfully:', tokenData.user_id);
  } catch (error) {
    console.error('[Telegram] Exception during user update:', error);
    // Fire-and-forget: Don't wait for error message
    sendTelegramMessage(
      telegramId,
      '❌ <b>Connection Failed</b>\n\nPlease try again or contact support.',
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send error message:', err));
    return;
  }

  // Success! Send confirmation (fire-and-forget)
  console.log('[Telegram] Sending success message to user:', telegramId);
  sendTelegramMessage(
    telegramId,
    `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• New messages from clients/professionals\n• Task completion confirmations\n• Payment notifications\n\nYou can manage notification preferences in your profile settings on the website.`,
    'HTML'
  ).catch(err => console.error('[Telegram] Failed to send success message:', err));
  console.log('[Telegram] Success message queued (not waiting for response)');
}

async function sendWelcomeMessage(chatId: number) {
  // Fire-and-forget: Send welcome message without waiting
  sendTelegramMessage(
    chatId,
    `👋 <b>Welcome to Trudify!</b>\n\nTrudify connects customers with verified professionals for various services in Bulgaria.\n\n<b>To connect your Telegram account:</b>\n1. Login to Trudify website (task-bridge-chi.vercel.app)\n2. Go to Profile → Settings\n3. Click "Connect Telegram"\n4. Follow the link that opens\n\nThis will enable instant notifications for all your tasks and applications!`,
    'HTML'
  ).catch(err => console.error('[Telegram] Failed to send welcome message:', err));
}

async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('[Telegram] TG_BOT_TOKEN not configured');
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    // Add 10 second timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Telegram] API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return false;
    }

    return true;
  } catch (error) {
    // Check if it was a timeout
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('[Telegram] Exception sending message:', {
      error: error instanceof Error ? error.message : String(error),
      isTimeout,
      chatId,
      textPreview: text.substring(0, 50) + '...'
    });
    return false;
  }
}
