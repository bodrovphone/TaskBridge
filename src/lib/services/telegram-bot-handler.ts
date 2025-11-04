/**
 * Telegram Bot Command Handler
 *
 * Handles /start command and sends user their telegram_id
 * Simple flow: Bot sends ID → User pastes into website
 */

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
  const startTime = Date.now();
  console.log('[Telegram] ⏱️ Webhook received at:', new Date().toISOString());

  try {
    const message = update.message;
    if (!message || !message.text) {
      console.log('[Telegram] ⚠️ No message or text, ignoring');
      return;
    }

    const text = message.text;
    const chatId = message.chat.id;
    const telegramUserId = message.from.id;

    console.log('[Telegram] 📨 Message received:', {
      text,
      chatId,
      telegramUserId,
      username: message.from.username,
      elapsedMs: Date.now() - startTime
    });

    // Check if it's a /start command
    if (!message.text.startsWith('/start')) {
      console.log('[Telegram] ⚠️ Not a /start command, ignoring');
      return;
    }

    console.log('[Telegram] ✅ /start command detected, triggering handleStartCommand (fire-and-forget)');

    // Simple flow: Send telegram_id with greeting in user's language (fire-and-forget)
    handleStartCommand(telegramUserId, message.from, chatId)
      .catch(err => console.error('[Telegram] ❌ Error in handleStartCommand:', err));

    console.log('[Telegram] ⏱️ Webhook handler completed in:', Date.now() - startTime, 'ms');
  } catch (error) {
    console.error('[Telegram Handler] ❌ FATAL EXCEPTION:', error);
    console.error('[Telegram Handler] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[Telegram Handler] ⏱️ Failed after:', Date.now() - startTime, 'ms');
  }
}

async function handleStartCommand(
  telegramId: number,
  telegramUser: NonNullable<TelegramUpdate['message']>['from'],
  chatId: number
) {
  const startTime = Date.now();
  console.log('[Telegram] 🚀 handleStartCommand started for user:', telegramId);

  try {
    // Detect user's language (default to English)
    const languageCode = telegramUser.language_code?.toLowerCase() || 'en';

    // Map Telegram language codes to our supported languages
    let lang = 'en'; // default
    if (languageCode.startsWith('bg')) lang = 'bg';
    else if (languageCode.startsWith('ru')) lang = 'ru';

    console.log('[Telegram] 🌍 Detected language:', lang, '(code:', languageCode + ')');

    // Greeting messages in different languages
    const greetings: Record<string, string> = {
      en: `👋 <b>Welcome to Trudify!</b>\n\n✨ <b>Connect Your Account</b>\n\nTo receive instant notifications about your tasks, applications, and messages:\n\n<b>1.</b> Copy your Telegram ID below\n<b>2.</b> Go to your Trudify profile\n<b>3.</b> Click "Connect Telegram"\n<b>4.</b> Paste your Telegram ID\n\n🆔 <b>Your Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>Tap to copy, then paste it in your profile.</i>`,

      bg: `👋 <b>Добре дошли в Trudify!</b>\n\n✨ <b>Свържете вашия акаунт</b>\n\nЗа да получавате мигновени известия за задачите, приложенията и съобщенията си:\n\n<b>1.</b> Копирайте вашия Telegram ID по-долу\n<b>2.</b> Отидете в профила си в Trudify\n<b>3.</b> Натиснете "Свържи Telegram"\n<b>4.</b> Поставете вашия Telegram ID\n\n🆔 <b>Вашият Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>Докоснете за копиране, след това го поставете в профила си.</i>`,

      ru: `👋 <b>Добро пожаловать в Trudify!</b>\n\n✨ <b>Подключите ваш аккаунт</b>\n\nЧтобы получать мгновенные уведомления о ваших задачах, заявках и сообщениях:\n\n<b>1.</b> Скопируйте ваш Telegram ID ниже\n<b>2.</b> Перейдите в ваш профиль Trudify\n<b>3.</b> Нажмите "Подключить Telegram"\n<b>4.</b> Вставьте ваш Telegram ID\n\n🆔 <b>Ваш Telegram ID:</b>\n<code>${telegramId}</code>\n\n<i>Нажмите для копирования, затем вставьте в профиль.</i>`
    };

    console.log('[Telegram] 📤 Sending greeting message to chatId:', chatId);

    // Send greeting with telegram_id (fire-and-forget)
    sendTelegramMessage(
      chatId,
      greetings[lang],
      'HTML'
    ).catch(err => console.error('[Telegram] ❌ Failed to send greeting:', err));

    console.log('[Telegram] ⏱️ handleStartCommand completed in:', Date.now() - startTime, 'ms');
  } catch (error) {
    console.error('[Telegram] ❌ Exception in start command:', error);
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
