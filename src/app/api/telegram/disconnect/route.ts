/**
 * Disconnect Telegram Account API
 *
 * Removes Telegram connection from user profile while preserving other user data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Remove Telegram credentials from user and reset contact preferences to email
    const { error: updateError } = await supabase
      .from('users')
      .update({
        telegram_id: null,
        telegram_username: null,
        telegram_first_name: null,
        telegram_last_name: null,
        telegram_photo_url: null,
        preferred_notification_channel: 'email', // Fallback to email
        preferred_contact: 'email', // Also reset preferred contact method
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error disconnecting Telegram:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect Telegram' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in disconnect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
