/**
 * Telegram Notification API Route
 *
 * Sends Telegram notifications to users
 * Used by internal services to trigger notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification, sendTemplatedNotification } from '@/lib/services/telegram-notification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, notificationType, parseMode, templateName, templateArgs } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let result;

    // If using a template
    if (templateName) {
      result = await sendTemplatedNotification(
        userId,
        templateName,
        ...(templateArgs || [])
      );
    }
    // If sending a custom message
    else if (message && notificationType) {
      result = await sendTelegramNotification({
        userId,
        message,
        notificationType,
        parseMode: parseMode || 'HTML',
      });
    } else {
      return NextResponse.json(
        { error: 'Either provide (message + notificationType) or (templateName + templateArgs)' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
