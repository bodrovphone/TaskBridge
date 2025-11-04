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
    const { telegramId, userId } = await request.json();

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

    // Update user with Telegram ID
    const { error: updateError } = await supabase
      .from('users')
      .update({
        telegram_id: telegramIdNumber,
        preferred_notification_channel: 'telegram',
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

    // Send confirmation message to Telegram user
    await sendConfirmationMessage(telegramIdNumber);

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

async function sendConfirmationMessage(telegramId: number) {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('[Telegram] TG_BOT_TOKEN not configured');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: `✅ <b>Successfully Connected!</b>\n\nYour Telegram account is now connected to Trudify.\n\n<b>You'll receive instant notifications for:</b>\n• New applications on your tasks\n• Application status updates\n• New messages from clients/professionals\n• Task completion confirmations\n• Payment notifications\n\nYou can manage notification preferences in your profile settings on the website.`,
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
