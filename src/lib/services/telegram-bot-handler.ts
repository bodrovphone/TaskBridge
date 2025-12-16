/**
 * Telegram Bot Command Handler
 *
 * Handles /start command with two flows:
 * 1. Auto-connect flow: /start {locale}_{token} → validates token and auto-links account
 * 2. Manual flow: /start {locale} → sends telegram_id for user to paste into website
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
    if (!message || !message.text) {
      return;
    }

    const text = message.text;
    const chatId = message.chat.id;
    const telegramUserId = message.from.id;
    const telegramUser = message.from;

    // Check if it's a /start command
    if (!message.text.startsWith('/start')) {
      return;
    }

    // Extract start parameter (e.g., "/start ua_abc123" or "/start ua")
    const startParam = text.split(' ')[1] || 'bg';

    // Check if this is a token-based auto-connect request
    // Format: {locale}_{token} where token is 24 hex chars
    if (startParam.includes('_') && startParam.length > 10) {
      const [locale, token] = startParam.split('_');

      if (token && token.length >= 20) {
        // Try auto-connect flow
        const connected = await handleAutoConnect(telegramUserId, telegramUser, chatId, locale, token);
        if (connected) {
          return; // Success - don't fall through to manual flow
        }
        // If auto-connect failed, fall through to manual flow
      }
    }

    // Manual flow: Send telegram_id with greeting in app's language
    await handleManualFlow(telegramUserId, chatId, startParam);
  } catch (error) {
    console.error('[Telegram Handler] ❌ FATAL EXCEPTION:', error);
    console.error('[Telegram Handler] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  }
}

/**
 * Auto-connect flow: Validate token and link Telegram account automatically
 * Returns true if successful, false if should fall back to manual flow
 */
async function handleAutoConnect(
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from'],
  chatId: number,
  locale: string,
  token: string
): Promise<boolean> {
  const startTime = Date.now();
  console.log('[Telegram] 🔐 Auto-connect attempt with token:', token.substring(0, 8) + '...');

  try {
    const supabase = createAdminClient();

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('telegram_connection_tokens')
      .select('user_id, locale, used, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.log('[Telegram] ❌ Token not found or invalid');
      return false;
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log('[Telegram] ❌ Token expired');
      return false;
    }

    // Check if token already used
    if (tokenData.used) {
      console.log('[Telegram] ❌ Token already used');
      return false;
    }

    // Check if this telegram_id is already connected to another user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .neq('id', tokenData.user_id)
      .single();

    if (existingUser) {
      console.log('[Telegram] ❌ Telegram already connected to another account');
      // Send error message
      const lang = normalizeLocale(tokenData.locale || locale);
      await sendTelegramMessage(chatId, getAlreadyConnectedMessage(lang), 'HTML');
      return true; // Don't fall back, we've handled it
    }

    // Connect the account
    const { error: updateError } = await supabase
      .from('users')
      .update({
        telegram_id: telegramId,
        telegram_username: telegramUser.username || null,
        telegram_first_name: telegramUser.first_name || null,
        telegram_last_name: telegramUser.last_name || null,
        preferred_notification_channel: 'telegram',
        preferred_contact: 'telegram',
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id);

    if (updateError) {
      console.error('[Telegram] ❌ Failed to update user:', updateError);
      return false;
    }

    // Mark token as used
    await supabase
      .from('telegram_connection_tokens')
      .update({ used: true })
      .eq('token', token);

    // Send success message
    const lang = normalizeLocale(tokenData.locale || locale);
    await sendTelegramMessage(chatId, getAutoConnectSuccessMessage(lang), 'HTML');

    console.log('[Telegram] ✅ Auto-connect successful in:', Date.now() - startTime, 'ms');
    return true;

  } catch (error) {
    console.error('[Telegram] ❌ Auto-connect error:', error);
    return false;
  }
}

/**
 * Normalize locale to supported languages
 */
function normalizeLocale(locale: string): string {
  const SUPPORTED_LOCALES = ['en', 'bg', 'ru', 'ua'];
  const langCode = locale?.slice(0, 2) || 'en';
  return SUPPORTED_LOCALES.includes(langCode) ? langCode : 'en';
}

/**
 * Get success message for auto-connect
 */
function getAutoConnectSuccessMessage(lang: string): string {
  const messages: Record<string, string> = {
    en: `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now linked to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• Messages from clients/professionals\n• Task completions\n\n🎉 You're all set!`,

    bg: `✅ <b>Успешно свързване!</b>\n\nВашият Telegram акаунт е свързан с Trudify.\n\n<b>Ще получавате мигновени известия за:</b>\n• Нови кандидатури за задачите ви\n• Актуализации на статуса\n• Съобщения от клиенти/специалисти\n• Завършени задачи\n\n🎉 Готови сте!`,

    ru: `✅ <b>Успешно подключено!</b>\n\nВаш Telegram аккаунт связан с Trudify.\n\n<b>Вы будете получать уведомления о:</b>\n• Новых заявках на ваши задачи\n• Обновлениях статуса\n• Сообщениях от клиентов/специалистов\n• Завершении задач\n\n🎉 Всё готово!`,

    ua: `✅ <b>Успішно підключено!</b>\n\nВаш Telegram акаунт пов'язано з Trudify.\n\n<b>Ви отримуватимете сповіщення про:</b>\n• Нові заявки на ваші завдання\n• Оновлення статусу\n• Повідомлення від клієнтів/фахівців\n• Завершення завдань\n\n🎉 Все готово!`
  };
  return messages[lang] || messages.en;
}

/**
 * Get error message when Telegram already connected to another account
 */
function getAlreadyConnectedMessage(lang: string): string {
  const messages: Record<string, string> = {
    en: `⚠️ <b>Already Connected</b>\n\nThis Telegram account is already linked to another Trudify account.\n\nIf you want to connect it to a different account, first disconnect it from the current one in your profile settings.`,

    bg: `⚠️ <b>Вече е свързан</b>\n\nТози Telegram акаунт вече е свързан с друг Trudify акаунт.\n\nАко искате да го свържете с друг акаунт, първо го разкачете от текущия в настройките на профила.`,

    ru: `⚠️ <b>Уже подключен</b>\n\nЭтот Telegram аккаунт уже связан с другим аккаунтом Trudify.\n\nЕсли хотите подключить его к другому аккаунту, сначала отключите его в настройках профиля.`,

    ua: `⚠️ <b>Вже підключено</b>\n\nЦей Telegram акаунт вже пов'язаний з іншим акаунтом Trudify.\n\nЯкщо хочете підключити його до іншого акаунту, спочатку від'єднайте його в налаштуваннях профілю.`
  };
  return messages[lang] || messages.en;
}

/**
 * Manual flow: Send telegram_id for user to copy/paste
 */
async function handleManualFlow(
  telegramId: number,
  chatId: number,
  localeParam: string = 'en'
) {
  const startTime = Date.now();
  try {
    const lang = normalizeLocale(localeParam);

    // Greeting messages in different languages (without telegram_id)
    const greetings: Record<string, string> = {
      en: `👋 <b>Welcome to Trudify!</b>\n\n✨ <b>Connect Your Account</b>\n\nTo receive instant notifications about your tasks, applications, and messages:\n\n<b>1.</b> Copy your Telegram ID from the next message\n<b>2.</b> Go to your Trudify profile\n<b>3.</b> Click "Connect Telegram"\n<b>4.</b> Paste your Telegram ID`,

      bg: `👋 <b>Добре дошли в Trudify!</b>\n\n✨ <b>Свържете вашия акаунт</b>\n\nЗа да получавате мигновени известия за задачите, приложенията и съобщенията си:\n\n<b>1.</b> Копирайте вашия Telegram ID от следващото съобщение\n<b>2.</b> Отидете в профила си в Trudify\n<b>3.</b> Натиснете "Свържи Telegram"\n<b>4.</b> Поставете вашия Telegram ID`,

      ru: `👋 <b>Добро пожаловать в Trudify!</b>\n\n✨ <b>Подключите ваш аккаунт</b>\n\nЧтобы получать мгновенные уведомления о ваших задачах, заявках и сообщениях:\n\n<b>1.</b> Скопируйте ваш Telegram ID из следующего сообщения\n<b>2.</b> Перейдите в ваш профиль Trudify\n<b>3.</b> Нажмите "Подключить Telegram"\n<b>4.</b> Вставьте ваш Telegram ID`,

      ua: `👋 <b>Ласкаво просимо до Trudify!</b>\n\n✨ <b>Підключіть ваш акаунт</b>\n\nЩоб отримувати миттєві сповіщення про ваші завдання, заявки та повідомлення:\n\n<b>1.</b> Скопіюйте ваш Telegram ID з наступного повідомлення\n<b>2.</b> Перейдіть до вашого профілю Trudify\n<b>3.</b> Натисніть "Підключити Telegram"\n<b>4.</b> Вставте ваш Telegram ID`
    };

    // Code messages in different languages (separate message for easy copying)
    const codeMessages: Record<string, string> = {
      en: `🆔 <b>Your Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>👆 Tap the code above to copy it</i>`,
      bg: `🆔 <b>Вашият Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>👆 Докоснете кода по-горе, за да го копирате</i>`,
      ru: `🆔 <b>Ваш Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>👆 Нажмите на код выше, чтобы скопировать его</i>`,
      ua: `🆔 <b>Ваш Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>👆 Натисніть на код вище, щоб скопіювати його</i>`
    };

    console.log('[Telegram] 📤 Sending greeting message to chatId:', chatId);

    // Send greeting first
    await sendTelegramMessage(
      chatId,
      greetings[lang],
      'HTML'
    );

    console.log('[Telegram] 📤 Sending code message to chatId:', chatId);

    // Send code in separate message for easy copying
    await sendTelegramMessage(
      chatId,
      codeMessages[lang],
      'HTML'
    );

    console.log('[Telegram] ⏱️ Manual flow completed in:', Date.now() - startTime, 'ms');
  } catch (error) {
    console.error('[Telegram] ❌ Exception in manual flow:', error);
    console.error('[Telegram] ⏱️ Failed after:', Date.now() - startTime, 'ms');
  }
}

async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const startTime = Date.now();
  console.log('[Telegram] 📨 sendTelegramMessage started for chatId:', chatId);

  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('[Telegram] ❌ TG_BOT_TOKEN not configured');
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    // Add 30 second timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log('[Telegram] 🌐 Sending POST to Telegram API...');
    console.log('[Telegram] 🔍 Request details:', {
      url: url.substring(0, 50) + '...',
      chatId,
      textLength: text.length,
      parseMode
    });

    const fetchStart = Date.now();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode
      }),
      signal: controller.signal
    }).catch(err => {
      console.error('[Telegram] 🔥 Fetch threw exception:', err);
      throw err;
    });

    clearTimeout(timeoutId);
    console.log('[Telegram] 🌐 Telegram API responded in:', Date.now() - fetchStart, 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Telegram] ❌ API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        elapsedMs: Date.now() - startTime
      });
      return false;
    }

    console.log('[Telegram] ✅ Message sent successfully in:', Date.now() - startTime, 'ms');
    return true;
  } catch (error) {
    // Check if it was a timeout
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('[Telegram] ❌ Exception sending message:', {
      error: error instanceof Error ? error.message : String(error),
      isTimeout,
      chatId,
      textPreview: text.substring(0, 50) + '...',
      elapsedMs: Date.now() - startTime
    });
    return false;
  }
}
