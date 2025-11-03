/**
 * Telegram Bot Webhook API
 *
 * Receives updates from Telegram Bot API and processes them
 * Webhook URL: https://task-bridge-chi.vercel.app/api/telegram/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramBotUpdate } from '@/lib/services/telegram-bot-handler';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook is from Telegram (optional but recommended)
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');

    if (process.env.TG_WEBHOOK_SECRET && secretToken !== process.env.TG_WEBHOOK_SECRET) {
      console.error('[Telegram Webhook] Invalid webhook secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await request.json();
    console.log('[Telegram Webhook] Received update:', {
      update_id: update.update_id,
      message: update.message?.text,
      from: update.message?.from?.username
    });

    // Handle the update asynchronously (don't await to respond quickly to Telegram)
    handleTelegramBotUpdate(update).catch(error => {
      console.error('[Telegram Webhook] Error handling update:', error);
    });

    // Return 200 immediately (Telegram requirement - must respond within 60 seconds)
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Handle GET requests (for webhook verification during setup)
export async function GET() {
  return NextResponse.json({
    status: 'Telegram webhook endpoint',
    bot: 'Trudify_bot'
  });
}
