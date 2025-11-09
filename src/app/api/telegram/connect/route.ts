/**
 * Telegram Connection API
 * POST /api/telegram/connect
 *
 * Connects user account with their Telegram ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { telegramId, userId, locale = 'en' } = await request.json();

    if (!telegramId || !userId) {
      return NextResponse.json(
        { error: 'Telegram ID and userId required' },
        { status: 400 }
      );
    }

    // Validate telegram_id is a number
    const telegramIdNumber = parseInt(telegramId, 10);
    if (isNaN(telegramIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid Telegram ID format' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if this telegram_id is already connected to another user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramIdNumber)
      .neq('id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'This Telegram account is already connected to another user' },
        { status: 409 }
      );
    }

    // Fetch Telegram user profile information from Bot API
    const telegramUserInfo = await getTelegramUserInfo(telegramIdNumber);

    // Update user with Telegram ID, profile info, and set both notification fields
    const { error: updateError } = await supabase
      .from('users')
      .update({
        telegram_id: telegramIdNumber,
        telegram_username: telegramUserInfo?.username || null,
        telegram_first_name: telegramUserInfo?.first_name || null,
        telegram_last_name: telegramUserInfo?.last_name || null,
        telegram_photo_url: telegramUserInfo?.photo_url || null,
        preferred_notification_channel: 'telegram',
        preferred_contact: 'telegram', // Also set preferred contact method
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[Telegram] Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to connect account' },
        { status: 500 }
      );
    }

    console.log('[Telegram] Successfully connected user:', userId, 'to telegram_id:', telegramIdNumber);

    // Send confirmation message to Telegram user in the app's locale
    await sendConfirmationMessage(telegramIdNumber, locale);

    return NextResponse.json({
      success: true,
      telegram_id: telegramIdNumber
    });

  } catch (error) {
    console.error('[Telegram] Connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendConfirmationMessage(telegramId: number, locale: string = 'en') {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('[Telegram] TG_BOT_TOKEN not configured');
    return;
  }

  // Normalize locale to supported language
  const lang = locale.startsWith('bg') ? 'bg' : locale.startsWith('ru') ? 'ru' : 'en';

  // Multilingual confirmation messages
  const confirmationMessages: Record<string, string> = {
    en: `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• New messages from clients/professionals\n• Task completion confirmations\n• Payment notifications\n\nYou can manage notification preferences in your profile settings on the website.`,

    bg: `✅ <b>Успешно свързване!</b>\n\nВашият Telegram акаунт вече е свързан с Trudify.\n\n<b>Ще получавате мигновени известия за:</b>\n• Нови кандидатури за вашите задачи\n• Актуализации на статуса на кандидатури\n• Нови съобщения от клиенти/специалисти\n• Потвърждения за завършване на задачи\n• Известия за плащания\n\nМожете да управлявате предпочитанията за известия в настройките на профила си на уебсайта.`,

    ru: `✅ <b>Успешно подключено!</b>\n\nВаш Telegram аккаунт теперь подключен к Trudify.\n\n<b>Вы будете получать мгновенные уведомления о:</b>\n• Новых заявках на ваши задачи\n• Обновлениях статуса заявок\n• Новых сообщениях от клиентов/специалистов\n• Подтверждениях завершения задач\n• Уведомлениях о платежах\n\nВы можете управлять настройками уведомлений в настройках профиля на сайте.`
  };

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: confirmationMessages[lang],
        parse_mode: 'HTML'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
  } catch (error) {
    console.error('[Telegram] Failed to send confirmation message:', error);
    // Don't fail the whole request if message fails
  }
}

interface TelegramUserInfo {
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

async function getTelegramUserInfo(telegramId: number): Promise<TelegramUserInfo | null> {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('[Telegram] TG_BOT_TOKEN not configured');
    return null;
  }

  try {
    // Use getUserProfilePhotos to get user info
    const url = `https://api.telegram.org/bot${botToken}/getChat`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Telegram] Failed to get user info:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.ok || !data.result) {
      console.error('[Telegram] Invalid response from getChat:', data);
      return null;
    }

    const user = data.result;

    // Try to get profile photo URL
    let photoUrl: string | undefined;
    try {
      const photosResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: telegramId,
          limit: 1
        })
      });

      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        if (photosData.ok && photosData.result?.photos?.[0]?.[0]?.file_id) {
          const fileId = photosData.result.photos[0][0].file_id;

          // Get file path
          const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_id: fileId })
          });

          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            if (fileData.ok && fileData.result?.file_path) {
              photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
            }
          }
        }
      }
    } catch (photoError) {
      console.error('[Telegram] Failed to get profile photo:', photoError);
      // Continue without photo
    }

    return {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: photoUrl
    };
  } catch (error) {
    console.error('[Telegram] Error fetching user info:', error);
    return null;
  }
}
