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

  // Simple flow: Send telegram_id with greeting in user's language
  await handleStartCommand(telegramUserId, message.from, chatId);
  } catch (error) {
    console.error('[Telegram Handler] FATAL EXCEPTION:', error);
    console.error('[Telegram Handler] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  }
}

async function handleStartCommand(
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from'],
  chatId: number
) {
  try {
    // Detect user's language (default to English)
    const languageCode = telegramUser.language_code?.toLowerCase() || 'en';

    // Map Telegram language codes to our supported languages
    let lang = 'en'; // default
    if (languageCode.startsWith('bg')) lang = 'bg';
    else if (languageCode.startsWith('ru')) lang = 'ru';

    console.log('[Telegram] Start command from user:', telegramId, 'language:', lang);

    // Greeting messages in different languages
    const greetings: Record<string, string> = {
      en: `👋 <b>Welcome to Trudify!</b>\n\n✨ <b>Connect Your Account</b>\n\nTo receive instant notifications about your tasks, applications, and messages:\n\n<b>1.</b> Copy your Telegram ID below\n<b>2.</b> Go to your Trudify profile\n<b>3.</b> Click "Connect Telegram"\n<b>4.</b> Paste your Telegram ID\n\n🆔 <b>Your Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>Tap to copy, then paste it in your profile.</i>`,

      bg: `👋 <b>Добре дошли в Trudify!</b>\n\n✨ <b>Свържете вашия акаунт</b>\n\nЗа да получавате мигновени известия за задачите, приложенията и съобщенията си:\n\n<b>1.</b> Копирайте вашия Telegram ID по-долу\n<b>2.</b> Отидете в профила си в Trudify\n<b>3.</b> Натиснете "Свържи Telegram"\n<b>4.</b> Поставете вашия Telegram ID\n\n🆔 <b>Вашият Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>Докоснете за копиране, след това го поставете в профила си.</i>`,

      ru: `👋 <b>Добро пожаловать в Trudify!</b>\n\n✨ <b>Подключите ваш аккаунт</b>\n\nЧтобы получать мгновенные уведомления о ваших задачах, заявках и сообщениях:\n\n<b>1.</b> Скопируйте ваш Telegram ID ниже\n<b>2.</b> Перейдите в ваш профиль Trudify\n<b>3.</b> Нажмите "Подключить Telegram"\n<b>4.</b> Вставьте ваш Telegram ID\n\n🆔 <b>Ваш Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>Нажмите для копирования, затем вставьте в профиль.</i>`
    };

    // Send greeting with telegram_id (fire-and-forget)
    sendTelegramMessage(
      chatId,
      greetings[lang],
      'HTML'
    ).catch(err => console.error('[Telegram] Failed to send greeting:', err));

  } catch (error) {
    console.error('[Telegram] Exception in start command:', error);
  }
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
